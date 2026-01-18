# Scraper API

A Scraper API do **UniChat** expõe algumas funções auxiliares e permite a extração de dados de webviews.

---

### Logger API

Esta é uma global disponível como `uniChatLogger`.

Ele utiliza da logica de `parameterized logging` parecida com a biblioteca `slf4j` do Java.
Cada argumento irá sobrescrever o `{}` na mensagem, na ordem que foram passados.
Caso o ultimo argumento seja um erro, ele será logado como stacktrace e não fará parte da substituição.

Exemplo de uso:
```javascript
uniChatLogger.debug("Debug message: {}", "details here");
uniChatLogger.info("User {} has joined the chat", username);
uniChatLogger.warn("Low disk space: {}% remaining", freeSpacePercent);
uniChatLogger.error("Failed to load resource: {}", resourceUrl, new Error("Network error"));
```

#### Funções

- `uniChatLogger.trace(template, ...)`: Loga uma mensagem de rastreamento.
  | Argumento   | Tipo     | Descrição                                                                      |
  |-------------|----------|--------------------------------------------------------------------------------|
  | `template`  | `string` | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...         | `any`    | Argumentos para substituir os placeholders na mensagem.                        |


- `uniChatLogger.debug(template, ...)`: Loga uma mensagem de depuração.
  | Argumento   | Tipo     | Descrição                                                                      |
  |-------------|----------|--------------------------------------------------------------------------------|
  | `template`  | `string` | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...         | `any`    | Argumentos para substituir os placeholders na mensagem.                        |

- `uniChatLogger.info(template, ...)`: Loga uma mensagem de informação.
  | Argumento   | Tipo     | Descrição                                                                      |
  |-------------|----------|--------------------------------------------------------------------------------|
  | `template`  | `string` | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...         | `any`    | Argumentos para substituir os placeholders na mensagem.                        |

- `uniChatLogger.warn(template, ...)`: Loga uma mensagem de aviso.
  | Argumento   | Tipo     | Descrição                                                                      |
  |-------------|----------|--------------------------------------------------------------------------------|
  | `template`  | `string` | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...         | `any`    | Argumentos para substituir os placeholders na mensagem.                        |

- `uniChatLogger.error(template, ...)`: Loga uma mensagem de erro.
  | Argumento   | Tipo     | Descrição                                                                      |
  |-------------|----------|--------------------------------------------------------------------------------|
  | `template`  | `string` | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...         | `any`    | Argumentos para substituir os placeholders na mensagem.                        |

---

### Scraper API

Esta é uma global disponível como `uniChat`.

Ela expõe funções para ajudar na extração de dados de webviews.

Exemplo de uso:
```javascript
uniChat.preFetch = async function(args) {
    // Modify fetch arguments
    return args;
};

uniChat.onFetchResponse = async function(response, args) {
    // Process fetch response
};

uniChat.dispatchEvent({ type: "custom_event" });
```

#### Funções

#### Functions

- `uniChat.dispatchEvent(event)`: Emite um evento personalizado para o UniChat.
  | Argumento | Tipo     | Descrição                                  |
  |-----------|----------|--------------------------------------------|
  | `event`   | `object` | Objeto de evento contendo dados do evento. |

  Esta é a forma de comunicação do scraper script com o código LUA, o dado enviado será processado pela função `on_event` registrada no [`UniChatAPI:register_scraper`](/pt-br/plugins/unichat_api?id=unichatapiregister_scraperid-name-scraper_js_path-on_event-opts).

- `uniChat.preWebSocketSend(data, { wsInstance, url, protocols })`: Uma função atribuída que é chamada antes de uma mensagem WebSocket ser enviada.
  | Argumento                        | Tipo                                | Descrição                                                                                                                           |
  |----------------------------------|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
  | `data`                           | `string` \| `ArrayBuffer` \| `Blob` | Dados a serem enviados pelo WebSocket.                                                                                              |
  | `{ wsInstance, url, protocols }` | `object`                            | Contexto adicional sobre a conexão WebSocket.<br/>Veja [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). |

  Esta função pode ser atribuída pelo seu script scraper para modificar os dados antes de serem enviados.
  Ela deve retornar os dados modificados.

- `uniChat.onWebSocketMessage(event, { wsInstance, url, protocols })`: Uma função atribuída que é chamada quando uma mensagem WebSocket é recebida.
  | Argumento                        | Tipo           | Descrição                                                                                                                           |
  |----------------------------------|----------------|-------------------------------------------------------------------------------------------------------------------------------------|
  | `event`                          | `MessageEvent` | O evento de mensagem WebSocket.                                                                                                     |
  | `{ wsInstance, url, protocols }` | `object`       | Contexto adicional sobre a conexão WebSocket.<br/>Veja [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). |

  Esta função pode ser atribuída pelo seu script scraper para lidar com mensagens WebSocket recebidas.

- `uniChat.onWebSocketSend(data, { wsInstance, url, protocols })`: Uma função atribuída que é chamada após uma mensagem WebSocket ser enviada.
  | Argumento                        | Tipo                                | Descrição                                                                                                                           |
  |----------------------------------|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
  | `data`                           | `string` \| `ArrayBuffer` \| `Blob` | Os dados que foram enviados pelo WebSocket.                                                                                         |
  | `{ wsInstance, url, protocols }` | `object`                            | Contexto adicional sobre a conexão WebSocket.<br/>Veja [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). |

  Esta função pode ser atribuída pelo seu script scraper para lidar com ações pós-envio.

- `uniChat.preFetch(args)`: Uma função atribuída que é chamada antes de uma requisição fetch ser feita.
  | Argumento | Tipo    | Descrição                                                                                                                                       |
  |-----------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------|
  | `args`    | `array` | Os argumentos que serão passados para `fetch()`.<br/> Veja [MDN fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). |

  Esta função pode ser atribuída pelo seu script scraper para modificar os argumentos do fetch.
  Deve retornar os argumentos modificados.

- `uniChat.onFetchRequest(args)`: Uma função atribuída que é chamada após uma requisição fetch ser feita.
  | Argumento | Tipo    | Descrição                                                                                                                                       |
  |-----------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------|
  | `args`    | `array` | Os argumentos que foram passados para `fetch()`.<br/> Veja [MDN fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). |

  Esta função pode ser atribuída pelo seu script scraper para lidar com ações pós-requisição.

- `uniChat.onFetchResponse(response, args)`: Uma função atribuída que é chamada quando uma resposta fetch é recebida.
  | Argumento   | Tipo       | Descrição                                                                                                                                       |
  |-------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
  | `response`  | `Response` | O objeto de resposta do fetch.<br/> Veja [MDN Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).                             |
  | `args`      | `array`    | Os argumentos que foram passados para `fetch()`.<br/> Veja [MDN fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). |

  Esta função pode ser atribuída pelo seu script scraper para lidar com respostas fetch.

---

### Função `uniChatInit()`

O seu script scraper deve definir uma função global chamada `uniChatInit()`.
Ela é o ponto de entrada para inicializar qualquer lógica específica do scraper.

Exemplo de uso:
```javascript
async function uniChatInit() {
  return {}
}
```

Esta função é chamada uma vez quando o scraper é carregado.
Ela é uma função assíncrona que deve retornar um objeto. Qualquer outro tipo de retorno será ignorado e um objeto vazio será usado.

O objeto retornado será mesclado com o evento `ready` enviado para o código Lua.
