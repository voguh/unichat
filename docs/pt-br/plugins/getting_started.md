# Guia de Desenvolvimento de Plugins

### Tabela de Conteúdos
- [Introdução](#introdução)
- [Estrutura de um plugin](#estrutura-de-um-plugin)

### Extra
- [UniChat API](/pt-br/plugins/unichat_api)
- [UniChat Módulos](/pt-br/plugins/modules)

---

## Introdução

Os plugins do **UniChat** são escritos primariamente em Lua.

O que um plugin pode fazer?
- Registrar novos scrapers;
- Expor novos módulos para outros plugins utilizarem;
- Ouvir eventos do **UniChat** e reagir a eles;
- Visualizar/modificar o userstore;
- Prover widgets;

---

### Estrutura de um plugin

Os plugins podem ser instalados na pasta `plugins/` do **UniChat** localizada em:
- Windows: `%LOCALAPPDATA%\unichat\plugins\`
- Linux: `~/.local/share/unichat/plugins/`

Então, a estrutura de pastas de um plugin típico é a seguinte:
```
plugin-example
├── assets (opcional)
├── data
│   └── main.lua (entrypoint do plugin)
├── widgets (opcional)
├── icon.png (opcional)
└── manifest.yaml (obrigatório)
```

!> O nome da pasta do plugin deve conter apenas caracteres ASCII alfanuméricos, hífens ou underscores.

#### Pasta `assets/`

Esta pasta é opcional e tem o objetivo de prover arquivos estáticos. Eles podem ser acessados via URL `http://localhost:9527/assets/{plugin-id}/{asset-path}`.

#### Pasta `data/`

Esta pasta é obrigatória e deve conter ao menos um arquivo `main.lua`, que é o ponto de entrada do plugin. Todo o código do plugin deve estar dentro desta pasta.

!> Quando o plugin registra um scraper, o arquivo javascript do scraper deve estar dentro da pasta `data/` também.

#### Pasta `widgets/`

Esta pasta é opcional, ela pode conter subpastas com os widgets providos pelo plugin, veja o [Guia de Desenvolvimento de Widgets](/pt-br/widgets/getting_started) para mais detalhes.

#### Arquivo `icon.png`

Este arquivo é opcional e deve ser uma imagem PNG que representa o ícone do plugin. Se não for fornecido, um ícone padrão será usado.

#### Arquivo `manifest.yaml`

Este arquivo é obrigatório e deve conter as seguintes informações:

| Campo        | Tipo       | Obrigatório | Descrição                                           |
|--------------|------------|-------------|-----------------------------------------------------|
| name         | `string`   | SIM         | Nome do plugin                                      |
| description  | `string`   | NÃO         | Descrição do plugin                                 |
| version      | `string`   | SIM         | Versão do plugin                                    |
| author       | `string`   | NÃO         | Autor do plugin                                     |
| license      | `string`   | NÃO         | Licença do plugin <sup>[3]</sup>                    |
| homepage     | `string`   | NÃO         | URL da página inicial do plugin                     |
| dependencies | `string[]` | SIM         | Dependências do plugin <sup>[1]</sup><sup>[2]</sup> |

<sup>[1]</sup> Atualmente a única dependência verificada é `unichat` que informa o range de versão do **UniChat** requerido pelo plugin.

<sup>[2]</sup> As dependências devem seguir o formato `<dependency-name>@<version-range>`, onde `<version-range>` segue o seguinte padrão:
> | Exemplo         | Significado                                        |
> |-----------------|----------------------------------------------------|
> | `1.2.3`         | Exatamente a versão 1.2.3                          |
> | `[1.2.3,)`      | Versão 1.2.3 ou superior                           |
> | `[1.2.3,2.0.0)` | Versão entre 1.2.3 (inclusivo) e 2.0.0 (exclusivo) |
>
> Sendo os delimitadores `[]` inclusivo e `()` exclusivo.

<sup>[3]</sup> Nenhuma validação é feita atualmente, porém é aconselhável utilizar uma licença válida segundo a [SPDX License List](https://spdx.org/licenses/).

---

### Globais

| Nome              | Tipo       | Descrição                                                                                                                                    |
|-------------------|------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| __PLUGIN_NAME     | `string`   | Nome do plugin.                                                                                                                              |
| __PLUGIN_VERSION  | `string`   | Versão do plugin.                                                                                                                            |
| UniChatAPI        | `userdata` | Instância da API do **UniChat** para o plugin.<br/>Veja [UniChatAPI](/pt-br/plugins/unichat_api) para mais detalhes.                         |
| UniChatPlatform   | `userdata` | Uma `factory` para preencher o nome da plataforma.<br/>Veja [UniChatPlatform](/pt-br/plugins/modules?id=unichatplatform) para mais detalhes. |
| UniChatAuthorType | `userdata` | Uma `factory` para preencher o nome do autor.<br/>Veja [UniChatAuthorType](/pt-br/plugins/modules?id=unichatauthortype) para mais detalhes.  |
| UniChatEvent      | `userdata` | Uma `factory` para preencher o nome do evento.<br/>Veja [UniChatEvent](/pt-br/plugins/modules?id=unichatevent) para mais detalhes.           |
| UniChatEmote      | `userdata` | Uma `factory` para preencher o nome do emote.<br/>Veja [UniChatEmote](/pt-br/plugins/modules?id=unichatemote) para mais detalhes.            |
| UniChatBadge      | `userdata` | Uma `factory` para preencher o nome do badge.<br/>Veja [UniChatBadge](/pt-br/plugins/modules?id=unichatbadge) para mais detalhes.            |
