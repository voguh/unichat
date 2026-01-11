# Módulos Auxiliares do UniChat

Módulos auxiliares são bibliotecas built-in fornecidas pelo **UniChat** para auxiliar desenvolvedores de plugins com tarefas comuns.
Estes módulos podem ser acessados através do `require` em seu código Lua do plugin.

---

## Módulo `unichat:http`

O módulo HTTP do **UniChat** está disponível via `require` como `unichat:http`.

Exemplo de uso:
```lua
local http = require("unichat:http");

local response = http:get("https://api.example.com/data");
print("Response Status Code:", response.status_code);

if response.ok then
    local json = response:json(); -- table
    print("Response Data:", json);

    local json = response:text(); -- string
    print("Response Text:", json);
end
```

#### Funções

- `http:get(url, args)`: Envia uma requisição GET para a URL especificada e retorna [`UniChatHttpResponse`](#unichathttpresponse).
  | Argumento | Tipo               | Descrição                                                                                           |
  |-----------|--------------------|-----------------------------------------------------------------------------------------------------|
  | `url`     | `string`           | A URL para enviar a requisição GET.                                                                 |
  | `args`    | `UniChatHttpArgs?` | Tabela opcional de opções adicionais.<br/>Veja [`UniChatHttpArgs`](#unichathttpargs) para detalhes. |

- `http:post(url, body, args)`: Envia uma requisição POST para a URL especificada com o corpo fornecido e retorna [`UniChatHttpResponse`](#unichathttpresponse).
  | Argumento | Tipo                         | Descrição                                                                                           |
  |-----------|------------------------------|-----------------------------------------------------------------------------------------------------|
  | `url`     | `string`                     | A URL para enviar a requisição POST.                                                                |
  | `body`    | `string` \| `table` \| `nil` | O corpo da requisição POST.                                                                         |
  | `args`    | `UniChatHttpArgs?`           | Tabela opcional de opções adicionais.<br/>Veja [`UniChatHttpArgs`](#unichathttpargs) para detalhes. |

- `http:put(url, body, args)`: Envia uma requisição PUT para a URL especificada com o corpo fornecido e retorna [`UniChatHttpResponse`](#unichathttpresponse).
  | Argumento | Tipo                         | Descrição                                                                                           |
  |-----------|------------------------------|-----------------------------------------------------------------------------------------------------|
  | `url`     | `string`                     | A URL para enviar a requisição PUT.                                                                 |
  | `body`    | `string` \| `table` \| `nil` | O corpo da requisição PUT.                                                                          |
  | `args`    | `UniChatHttpArgs?`           | Tabela opcional de opções adicionais.<br/>Veja [`UniChatHttpArgs`](#unichathttpargs) para detalhes. |

- `http:path(url, body, args)`: Envia uma requisição PATCH para a URL especificada com o corpo fornecido e retorna [`UniChatHttpResponse`](#unichathttpresponse).
  | Argumento | Tipo                         | Descrição                                                                                           |
  |-----------|------------------------------|-----------------------------------------------------------------------------------------------------|
  | `url`     | `string`                     | A URL para enviar a requisição PATCH.                                                               |
  | `body`    | `string` \| `table` \| `nil` | O corpo da requisição PATCH.                                                                        |
  | `args`    | `UniChatHttpArgs?`           | Tabela opcional de opções adicionais.<br/>Veja [`UniChatHttpArgs`](#unichathttpargs) para detalhes. |

- `http:delete(url, args)`: Envia uma requisição DELETE para a URL especificada e retorna [`UniChatHttpResponse`](#unichathttpresponse).
  | Argumento | Tipo               | Descrição                                                                                           |
  |-----------|--------------------|-----------------------------------------------------------------------------------------------------|
  | `url`     | `string`           | A URL para enviar a requisição DELETE.                                                              |
  | `args`    | `UniChatHttpArgs?` | Tabela opcional de opções adicionais.<br/>Veja [`UniChatHttpArgs`](#unichathttpargs) para detalhes. |

- `http:head(url, args)`: Envia uma requisição HEAD para a URL especificada e retorna [`UniChatHttpResponse`](#unichathttpresponse).
  | Argumento | Tipo               | Descrição                                                                                           |
  |-----------|--------------------|-----------------------------------------------------------------------------------------------------|
  | `url`     | `string`           | A URL para enviar a requisição HEAD.                                                                |
  | `args`    | `UniChatHttpArgs?` | Tabela opcional de opções adicionais.<br/>Veja [`UniChatHttpArgs`](#unichathttpargs) para detalhes. |

#### UniChatHttpArgs

Uma tabela de argumentos opcionais para requisições HTTP.

| Field          | Tipo      | Descrição                                                                                                                |
|----------------|-----------|--------------------------------------------------------------------------------------------------------------------------|
| `headers`      | `table?`  | Uma tabela de cabeçalhos para incluir na requisição. As chaves e valores devem ser strings.                              |
| `query_params` | `table?`  | Uma tabela de parâmetros de consulta para adicionar à URL. As chaves e valores devem ser strings.                        |
| `content_type` | `string?` | O tipo de conteúdo do corpo da requisição (por exemplo, "application/json"). É um alias para o cabeçalho `Content-Type`. |
| `basic_auth`   | `table?`  | Uma tabela com os campos `username` e `password` para autenticação básica.                                               |

#### UniChatHttpResponse

Um objeto userdata que representa a resposta de uma requisição HTTP.

| Campo         | Tipo      | Descrição                                                           |
|---------------|-----------|---------------------------------------------------------------------|
| `ok`          | `boolean` | Indica se a requisição foi bem-sucedida (código de status 200-299). |
| `status_code` | `number`  | O código de status HTTP da resposta.                                |
| `status_text` | `string`  | O texto de status da resposta.                                      |
| `headers`     | `table`   | Uma tabela de cabeçalhos da resposta.                               |
| `url`         | `string`  | A URL final da resposta (após redirecionamentos).                   |

| Funções                 | Argumentos     | Tipo de Retorno   | Descrição                                                                          |
|-------------------------|----------------|-------------------|------------------------------------------------------------------------------------|
| `response:header(name)` | `name: string` | `string` \| `nil` | Retorna o valor do cabeçalho de resposta especificado, ou `nil` se não encontrado. |
| `response:text()`       | ---            | `string`          | Retorna o corpo da resposta como uma string.                                       |
| `response:json()`       | ---            | `table`           | Analisa o corpo da resposta como JSON e o retorna como uma tabela Lua.             |
| `response:bytes()`      | ---            | `table`           | Retorna o corpo da resposta como um array de bytes.                                |

---

## Módulo `unichat:json`

O módulo JSON do **UniChat** está disponível via `require` como `unichat:json`.

Exemplo de uso:
```lua
local json = require("unichat:json");

local data = {
    name = "UniChat",
    version = "1.0.0"
};

local json_string = json:encode(data);
print(json_string);  -- Output: {"name":"UniChat","version":"1.0.0"}

local decoded_data = json:decode(json_string);
print(decoded_data.name);  -- Output: UniChat
```

#### Funções

- `json:encode(table)`: Esta função codifica uma tabela Lua em uma string JSON.
  | Argumento | Tipo    | Descrição                    |
  |-----------|---------|------------------------------|
  | table     | `table` | Tabela Lua a ser codificada. |

- `json:decode(string)`: Esta função decodifica uma string JSON em uma tabela Lua.
  | Argumento | Tipo     | Descrição                       |
  |-----------|----------|---------------------------------|
  | string    | `string` | String JSON a ser decodificada. |

---

## Módulo `unichat:logger`

O módulo Logger do **UniChat** está disponível via `require` como `unichat:logger`.

Ele utiliza da logica de `parameterized logging` parecida com a biblioteca `slf4j` do Java.
Cada argumento irá sobrescrever o `{}` na mensagem, na ordem que foram passados.
Caso o ultimo argumento seja um erro, ele será logado como stacktrace e não fará parte da substituição.

Exemplo de uso:
```lua
local logger = require("unichat:logger");

logger:info("This is an info message from my plugin.");
logger:warn("This is a warning message from my plugin.");
logger:info("This message was emitted from {}", __PLUGIN_NAME);
```

#### Funções

- `logger:debug(template, ...)`: Loga uma mensagem de depuração.
  | Argumento   | Tipo     | Descrição                                                                      |
  |-------------|----------|--------------------------------------------------------------------------------|
  | `template`  | `string` | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...         | `any`    | Argumentos para substituir os placeholders na mensagem.                        |

- `logger:info(template, ...)`: Loga uma mensagem de informação.
  | Argumento   | Tipo     | Descrição                                                                      |
  |-------------|----------|--------------------------------------------------------------------------------|
  | `template`  | `string` | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...         | `any`    | Argumentos para substituir os placeholders na mensagem.                        |

- `logger:warn(template, ...)`: Loga uma mensagem de aviso.
  | Argumento   | Tipo     | Descrição                                                                      |
  |-------------|----------|--------------------------------------------------------------------------------|
  | `template`  | `string` | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...         | `any`    | Argumentos para substituir os placeholders na mensagem.                        |

- `logger:error(template, ...)`: Loga uma mensagem de erro.
  | Argumento   | Tipo     | Descrição                                                                      |
  |-------------|----------|--------------------------------------------------------------------------------|
  | `template`  | `string` | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...         | `any`    | Argumentos para substituir os placeholders na mensagem.                        |

---

## Modulo `unichat:string`

O módulo String do **UniChat** está disponível via `require` como `unichat:string`.
Este módulo fornece funções utilitárias para manipulação de strings.

#### Funções
- `string:to_upper(str)`: Esta função retorna a string convertida para maiúsculas.
  | Argumento | Tipo     | Descrição                                |
  |-----------|----------|------------------------------------------|
  | `str`     | `string` | String a ser convertida para maiúsculas. |

- `string:to_lower(str)`: Esta função retorna a string convertida para minúsculas.
  | Argumento | Tipo     | Descrição                                |
  |-----------|----------|------------------------------------------|
  | `str`     | `string` | String a ser convertida para minúsculas. |

- `string:strip_prefix(str, prefix)`: Esta função retorna a string sem o prefixo, se ele existir, caso contrário retorna `nil`.
  | Argumento | Tipo     | Descrição                               |
  |-----------|----------|-----------------------------------------|
  | `str`     | `string` | String da qual o prefixo será removido. |
  | `prefix`  | `string` | Prefixo a ser removido da string.       |

- `string:strip_suffix(str, suffix)`: Esta função retorna a string sem o sufixo, se ele existir, caso contrário retorna `nil`.
  | Argumento | Tipo     | Descrição                              |
  |-----------|----------|----------------------------------------|
  | `str`     | `string` | String da qual o sufixo será removido. |
  | `suffix`  | `string` | Sufixo a ser removido da string.       |

- `string:starts_with(str, prefix)`: Esta função retorna um `boolean` indicando se a string começa com o prefixo.
  | Argumento | Tipo     | Descrição                 |
  |-----------|----------|---------------------------|
  | `str`     | `string` | String a ser verificada.  |
  | `prefix`  | `string` | Prefixo a ser verificado. |

- `string:ends_with(str, suffix)`: Esta função retorna um `boolean` indicando se a string começa com o sufixo.
  | Argumento | Tipo     | Descrição                 |
  |-----------|----------|---------------------------|
  | `str`     | `string` | String a ser verificada.  |
  | `suffix`  | `string` | Sufixo a ser verificado.  |

- `string:find(str, substring)`: Esta função retorna o índice (`1-based`) da primeira ocorrência da substring na string, ou `nil` se não for encontrada.
  | Argumento   | Tipo     | Descrição                             |
  |-------------|----------|---------------------------------------|
  | `str`       | `string` | String a ser pesquisada.              |
  | `substring` | `string` | Substring a ser encontrada na string. |

- `string:rfind(str, substring): number`: Esta função retorna o índice (`1-based`) da última ocorrência da substring na string, ou `nil` se não for encontrada.
  | Argumento   | Tipo     | Descrição                             |
  |-------------|----------|---------------------------------------|
  | `str`       | `string` | String a ser pesquisada.              |
  | `substring` | `string` | Substring a ser encontrada na string. |

- `string:is_empty(str)`: Esta função retorna um `boolean` indicando se a string está vazia.
  | Argumento | Tipo     | Descrição                |
  |-----------|----------|--------------------------|
  | `str`     | `string` | String a ser verificada. |

- `string:trim(str)`: Esta função retorna a string com espaços em branco removidos do início e do fim.
  | Argumento | Tipo     | Descrição             |
  |-----------|----------|-----------------------|
  | `str`     | `string` | String a ser trimada. |

- `string:trim_start(str)`: Esta função retorna a string com espaços em branco removidos do início.
  | Argumento | Tipo     | Descrição             |
  |-----------|----------|-----------------------|
  | `str`     | `string` | String a ser trimada. |

- `string:trim_end(str)`: Esta função retorna a string com espaços em branco removidos do fim.
  | Argumento | Tipo     | Descrição             |
  |-----------|----------|-----------------------|
  | `str`     | `string` | String a ser trimada. |

- `string:to_bytes(str)`: Esta função retorna uma tabela (`number[]`) de bytes representando a string.
  | Argumento | Tipo     | Descrição                |
  |-----------|----------|--------------------------|
  | `str`     | `string` | String a ser convertida. |

- `string:from_bytes(bytes)`: Esta função retorna uma string (UTF-8) construída a partir de uma tabela (`number[]`) de bytes.
  | Argumento | Tipo        | Descrição                         |
  |-----------|-------------|-----------------------------------|
  | `bytes`   | `number[]`  | Tabela de bytes a ser convertida. |

- `string:chars(str)`: Esta função retorna uma tabela (`string[]`) contendo cada caractere da string.
  | Argumento | Tipo     | Descrição              |
  |-----------|----------|------------------------|
  | `str`     | `string` | String a ser dividida. |

- `string:length(str)`: Esta função retorna o comprimento (número de caracteres) da string.
  | Argumento | Tipo     | Descrição            |
  |-----------|----------|----------------------|
  | `str`     | `string` | String a ser medida. |

- `string:replace(str, from, to, count)`: Esta função retorna a string com as ocorrências de `from` substituídas por `to`. O número de substituições é limitado por `count` (se fornecido).
  | Argumento | Tipo      | Descrição                                                  |
  |-----------|-----------|------------------------------------------------------------|
  | `str`     | `string`  | String a ser modificada.                                   |
  | `from`    | `string`  | Substring a ser substituída.                               |
  | `to`      | `string`  | Substring que substituirá a substring original.            |
  | `count`   | `number?` | (Opcional) Número máximo de substituições a serem feitas.  |

- `string:contains(str, substring)`: Esta função retorna um `boolean` indicando se a string contém a substring.
  | Argumento   | Tipo     | Descrição                            |
  |-------------|----------|--------------------------------------|
  | `str`       | `string` | String a ser verificada.             |
  | `substring` | `string` | Substring a ser procurada na string. |

- `string:split(str, delimiter)`: Esta função retorna uma tabela (`string[]`) contendo as partes da string divididas pelo delimitador.
  | Argumento   | Tipo     | Descrição                                |
  |-------------|----------|------------------------------------------|
  | `str`       | `string` | String a ser dividida.                   |
  | `delimiter` | `string` | Delimitador usado para dividir a string. |

---

## Módulo `unichat:time`

O módulo Time do **UniChat** está disponível via `require` como `unichat:time`.
Este módulo fornece funções utilitárias para manipulação de tempo e datas.

Exemplo de uso:
```lua
local time = require("unichat:time");

local current_timestamp = time:now();
print("Current Timestamp (ms since Unix epoch):", current_timestamp);
```

#### Funções
- `time:now()`: Esta função retorna o timestamp atual em milissegundos desde a época Unix (1 de janeiro de 1970).

---

## Módulo `unichat:yaml`

O módulo YAML do **UniChat** está disponível via `require` como `unichat:yaml`.
Este módulo fornece funções para codificação e decodificação de dados YAML.

Exemplo de uso:
```lua
local yaml = require("unichat:yaml");

local data = {
    name = "UniChat",
    version = "1.0.0"
};

local yaml_string = yaml:encode(data);
print(yaml_string);
-- Output:
-- name: UniChat
-- version: 1.0.0

local decoded_data = yaml:decode(yaml_string);
print(decoded_data.name);  -- Output: UniChat
```

#### Funções
- `yaml:encode(table)`: Esta função codifica uma tabela Lua em uma string YAML.
  | Argumento | Tipo    | Descrição                    |
  |-----------|---------|------------------------------|
  | `table`   | `table` | Tabela Lua a ser codificada. |

- `yaml:decode(string)`: Esta função decodifica uma string YAML em uma tabela Lua.
  | Argumento | Tipo     | Descrição                       |
  |-----------|----------|---------------------------------|
  | `str`     | `string` | String YAML a ser decodificada. |

!> **Nota:** O módulo YAML pode não suportar todos os recursos do YAML e é destinado a casos de uso básicos.
