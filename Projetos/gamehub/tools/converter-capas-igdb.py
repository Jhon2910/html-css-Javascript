import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

DADOS = os.path.join(os.path.dirname(__file__), "..", "js", "dados.js")
API = "https://api.igdb.com/v4"
INICIO = "// INICIO_CAPAS_IGDB_ESTATICAS"
FIM = "// FIM_CAPAS_IGDB_ESTATICAS"


def requisicao(url, data=None, headers=None, method=None):
    request = urllib.request.Request(
        url,
        data=data.encode("utf-8") if isinstance(data, str) else data,
        headers=headers or {},
        method=method,
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def normalizar(texto):
    return re.sub(r"[^a-z0-9]", "", texto.lower())


def obter_token(client_id, client_secret):
    url = "https://id.twitch.tv/oauth2/token?" + urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "client_credentials",
    })
    try:
        resposta = requisicao(url, method="POST")
    except urllib.error.HTTPError as erro:
        detalhe = erro.read().decode("utf-8", errors="replace")
        print("Falha na autenticação Twitch/IGDB:", detalhe)
        print("Confira o Client ID e o Client Secret no Twitch Developer Console.")
        sys.exit(1)
    return resposta["access_token"]


def nomes_dos_jogos(conteudo):
    nomes = re.findall(r"^\s*\[\d+,\s*\"([^\"]+)\",", conteudo, re.MULTILINE)
    nomes += re.findall(r"^\s*nome:\s*\"([^\"]+)\",", conteudo, re.MULTILINE)
    return list(dict.fromkeys(nomes))


def buscar_jogo(nome, headers):
    corpo = (
        'search "' + nome.replace('"', '') + '"; '
        "fields name,cover.image_id,artworks.image_id,screenshots.image_id; limit 10;"
    )
    resultados = requisicao(API + "/games", data=corpo, headers=headers, method="POST")
    alvo = normalizar(nome)
    ordenados = sorted(
        resultados,
        key=lambda jogo: (normalizar(jogo.get("name", "")) != alvo, -jogo.get("id", 0)),
    )
    for jogo in ordenados:
        capa = jogo.get("cover", {}).get("image_id")
        if capa:
            fundo = ""
            for campo in ("artworks", "screenshots"):
                imagens = jogo.get(campo, [])
                if imagens and imagens[0].get("image_id"):
                    fundo = imagens[0]["image_id"]
                    break
            return capa, fundo
    return None, None


def extrair_extras(conteudo):
    padrao = r"^\s*\[(\d+),\s*\"([^\"]+)\",\s*\"([^\"]+)\",\s*(\d+)\],"
    return [
        {
            "id": int(id_jogo),
            "nome": nome,
            "categoria": categoria,
            "steamAppId": int(steam_app_id),
        }
        for id_jogo, nome, categoria, steam_app_id in re.findall(
            padrao, conteudo, re.MULTILINE
        )
    ]


def atualizar_imagens_objetos(conteudo, capas):
    padrao = re.compile(r"(\{\n\s*id:\s*\d+,[\s\S]*?\n\s*\},)")

    def atualizar(match):
        objeto = match.group(1)
        nome_match = re.search(r'^\s*nome:\s*"([^"]+)",', objeto, re.MULTILINE)
        if not nome_match or nome_match.group(1) not in capas:
            return objeto

        capa = capas[nome_match.group(1)]
        objeto = re.sub(
            r'(^\s*imagem:)\s*"[^"]*",',
            rf'\1 "{capa["imagem"]}",',
            objeto,
            count=1,
            flags=re.MULTILINE,
        )
        objeto = re.sub(
            r'(^\s*fundo:)\s*"[^"]*",',
            rf'\1 "{capa["fundo"]}",',
            objeto,
            count=1,
            flags=re.MULTILINE,
        )
        return objeto

    return padrao.sub(atualizar, conteudo)


def gerar_extras(extras, capas):
    objetos = []
    for extra in extras:
        capa = capas.get(extra["nome"], {})
        imagem = capa.get("imagem", "")
        fundo = capa.get("fundo", imagem)
        categoria = extra["categoria"]
        nome = extra["nome"]
        objetos.append(
            "  {\n"
            f"    id: {extra['id']},\n"
            f'    nome: {json.dumps(nome, ensure_ascii=False)},\n'
            f'    nome_en: {json.dumps(nome, ensure_ascii=False)},\n'
            f'    categoria: {json.dumps(categoria, ensure_ascii=False)},\n'
            f'    categoria_en: {json.dumps(categoria, ensure_ascii=False)},\n'
            f'    imagem: {json.dumps(imagem)},\n'
            f'    fundo: {json.dumps(fundo)},\n'
            "    lancado: true,\n"
            "    nota: 4.5,\n"
            f'    descricaoCurta: {json.dumps(f"Um dos jogos mais famosos do gênero {categoria}.", ensure_ascii=False)},\n'
            f'    descricaoCurta_en: {json.dumps(f"One of the most famous games in the {categoria} genre.")},\n'
            f'    descricaoLonga: {json.dumps(f"Explore {nome} em uma experiência marcante para fãs de videogames.", ensure_ascii=False)},\n'
            f'    descricaoLonga_en: {json.dumps(f"Experience {nome}, a memorable game for fans around the world.")},\n'
            '    desenvolvedora: "Estúdio reconhecido da indústria",\n'
            '    lancamento: "Lançado",\n'
            '    plataformas: "PC, PlayStation, Xbox",\n'
            '    idiomas: "Português (Brasil), Inglês",\n'
            '    idiomas_en: "English, Portuguese (Brazil)",\n'
            "    dublado: false,\n"
            "    legendado: true,\n"
            '    trailer: "",\n'
            '    trailerUrl: ""\n'
            "  }"
        )
    return "const jogosExtrasCatalogo = [\n" + ",\n".join(objetos) + "\n];\n\n"


def executar():
    modo_estrutura = "--estrutura" in sys.argv
    modo_unificar = "--unificar" in sys.argv
    client_id = os.getenv("IGDB_CLIENT_ID", "").strip()
    client_secret = os.getenv("IGDB_CLIENT_SECRET", "").strip()
    if not modo_estrutura and not modo_unificar and (not client_id or not client_secret):
        print("Configure IGDB_CLIENT_ID e IGDB_CLIENT_SECRET antes de executar.")
        sys.exit(1)

    with open(DADOS, "r", encoding="utf-8") as arquivo:
        conteudo = arquivo.read()

    if modo_unificar:
        padrao = re.compile(
            r"const jogosExtrasCatalogo = \[\n([\s\S]*?)\n\];\n\n"
            r"const listaDeJogos = \[\n([\s\S]*?)\n\];\n\n(?P<marcador>// ={10,})"
        )
        correspondencia = padrao.search(conteudo)
        if not correspondencia:
            print("Não foi possível localizar as duas listas para unificar.")
            sys.exit(1)
        extras = correspondencia.group(1)
        lista = correspondencia.group(2).replace("  ...jogosExtrasCatalogo", "")
        unificada = "const listaDeJogos = [\n" + extras + ",\n" + lista + "\n];\n\n"
        conteudo = (
            conteudo[:correspondencia.start()]
            + unificada
            + correspondencia.group("marcador")
            + conteudo[correspondencia.end() :]
        )
        with open(DADOS, "w", encoding="utf-8") as arquivo:
            arquivo.write(conteudo)
        print("Listas unificadas: 325 objetos explícitos em listaDeJogos.")
        return

    headers = {}
    if not modo_estrutura:
        token = obter_token(client_id, client_secret)
        headers = {
            "Client-ID": client_id,
            "Authorization": "Bearer " + token,
            "Content-Type": "text/plain",
        }
    capas = {}
    nomes = nomes_dos_jogos(conteudo)
    extras = extrair_extras(conteudo)
    if modo_estrutura:
        for extra in extras:
            steam_app_id = extra["steamAppId"]
            capas[extra["nome"]] = {
                "imagem": f"https://cdn.cloudflare.steamstatic.com/steam/apps/{steam_app_id}/library_600x900_2x.jpg",
                "fundo": f"https://cdn.cloudflare.steamstatic.com/steam/apps/{steam_app_id}/page_bg_generated_v6b.jpg",
            }
    else:
        for indice, nome in enumerate(nomes, 1):
            capa, fundo = buscar_jogo(nome, headers)
            if capa:
                capas[nome] = {
                    "imagem": "https://images.igdb.com/igdb/image/upload/t_cover_big/" + capa + ".webp",
                    "fundo": "https://images.igdb.com/igdb/image/upload/t_1080p/" + (fundo or capa) + ".webp",
                }
                print(f"[{indice}/{len(nomes)}] OK  {nome}")
            else:
                print(f"[{indice}/{len(nomes)}] --  {nome}")
            time.sleep(0.25)

    conteudo = atualizar_imagens_objetos(conteudo, capas)
    inicio_extras = conteudo.find("const jogosExtrasCatalogo = [")
    inicio_lista = conteudo.find("const listaDeJogos = [")
    if inicio_extras < 0 or inicio_lista < 0 or inicio_extras > inicio_lista:
        print("Não foi possível localizar a lista de jogos extras.")
        sys.exit(1)
    conteudo = (
        conteudo[:inicio_extras]
        + gerar_extras(extras, capas)
        + conteudo[inicio_lista:]
    )

    with open(DADOS, "w", encoding="utf-8") as arquivo:
        arquivo.write(conteudo)
    descricao = "estrutura" if modo_estrutura else "capa IGDB"
    print(f"\nConversão concluída: {len(capas)} de {len(nomes)} jogos com {descricao}.")
    if not modo_estrutura and len(capas) != len(nomes):
        print("Atenção: jogos sem resultado IGDB permanecem sem URL IGDB.")


if __name__ == "__main__":
    executar()
