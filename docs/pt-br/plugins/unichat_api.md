# UniChat API

No ambiente Lua, você terá acesso à API do UniChat através do objeto global `UniChatAPI`.

#### Funções

- `UniChatAPI:register_scraper(id, name, scrapper_js_path, on_event, opts)`: Registra um novo scraper para o UniChat.
  | Argumento                                                   | Tipo       | Obrigatório | Descrição                                                                                                                                                                        |
  |-------------------------------------------------------------|------------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | id                                                          | `string`   | SIM         | Identificador único do scraper. Deve conter apenas caracteres ASCII alfanuméricos, hífens ou underscores e deve terminar com `-chat`.                                            |
  | name                                                        | `string`   | SIM         | Nome legível do scraper.                                                                                                                                                         |
  | scraper_js_path                                             | `string`   | SIM         | Caminho para o arquivo JavaScript que implementa o scraper. Este caminho deve ser relativo e o arquivo javascript deve estar dentro da pasta `data`.                             |
  | on_event                                                    | `function` | SIM         | Função para ouvir eventos do scraper.<br/>Esta função recebe como argumento uma `table` e deve retornar um `UniChatEvent` ou `nil`.                                              |
  | opts                                                        | `table`    | NÃO         | Tabela de opções adicionais para o scraper.                                                                                                                                      |
  | `opts.editing_tooltip_message`/`opts.editingTooltipMessage` | `string`   | NÃO         | Mensagem do tooltip de edição do scraper.<br/>Padrão: `Enter <scraper_name> chat url...`                                                                                         |
  | `opts.editing_tooltip_urls`/`opts.editingTooltipUrls`       | `string[]` | NÃO         | URLs validas para o scraper.<br/>Padrão: `{}`                                                                                                                                    |
  | `opts.placeholder_text`/`opts.placeholderText`              | `string`   | NÃO         | Texto do placeholder para o scraper.<br/>Padrão: `Enter <Scraper Name> chat url...`                                                                                              |
  | `opts.badges`                                               | `string[]` | NÃO         | Badges para o scraper.                                                                                                                                                           |
  | `opts.icon`                                                 | `string`   | NÃO         | Ícone para o scraper (FontAwesome 5).<br/>Padrão: `fas fa-video`                                                                                                                 |
  | `opts.validate_url`/`opts.validateUrl`                      | `function` | NÃO         | Função para validar URLs do scraper.<br/>Esta função recebe um único argumento `string` e deve retornar uma `string`.<br/>Padrão: Função padrão sempre retorna o valor original. |
  | `opts.on_ready`/`opts.onReady`                              | `function` | NÃO         | Função para ser chamada quando o scraper estiver iniciado.                                                                                                                       |
  | `opts.on_ping`/`opts.onPing`                                | `function` | NÃO         | Função para ser chamada quando o scraper receber um ping.                                                                                                                        |
  | `opts.on_error`/`opts.onError`                              | `function` | NÃO         | Função para ser chamada quando o scraper encontrar um erro.                                                                                                                      |

  Exemplo de uso:
  ```lua
  local function validate_kick_url(url)
      -- Logic to validate and possibly transform the chat URL.
  end

  local function on_kick_ready(event)
      -- Argument `event` contains values returned by js scraper `uniChatInit` function.
      -- You can handle scraper ready logic here. For example save channel_id.
  end

  local function on_kick_event(event)
      -- Argument `event` contains values returned by js scraper.
      -- You can handle scraper 'raw' events here and return a UniChatEvent.
  end

  local opts = {
      editing_tooltip_message = "You can enter just the channel name or one of the following URLs to get the Kick chat:",
      editing_tooltip_urls = {
          "kick.com/popout/{CHANNEL_NAME}/chat",
          "kick.com/{CHANNEL_NAME}",
      },
      placeholder_text = "https://kick.com/popout/{CHANNEL_NAME}/chat",
      badges = { "experimental" },
      icon = "fas fa-video",
      validate_url = validate_kick_url,
      on_ready = on_kick_ready
  }

  UniChatAPI:register_scraper("kick-chat", "Kick", "static/scraper.js", on_kick_event, opts);
  ```

- `UniChatAPI:fetch_shared_emotes(platform, channel_id)`: Busca os emotes `BTTV`, `FFZ` e `7TV` para a plataforma e id do canal informados.
  | Argumento  | Tipo     | Obrigatório | Descrição                                         |
  |------------|----------|-------------|---------------------------------------------------|
  | platform   | `string` | SIM         | ID do canal para buscar os emotes compartilhados. |
  | channel_id | `string` | SIM         | Função de callback que recebe os emotes.          |

- `UniChatAPI:expose_module(name, module)`: Expõe um módulo para outros plugins utilizarem.
  | Argumento | Tipo     | Obrigatório | Descrição                                                                     |
  |-----------|----------|-------------|-------------------------------------------------------------------------------|
  | name      | `string` | SIM         | Nome do módulo a ser exposto. (Ele será prefixado com `<plugin_name>:<name>`) |
  | module    | `table`  | SIM         | Tabela contendo as funções do módulo.                                         |

  Exemplo de uso:
  ```lua
  local my_module = {
      greet = function(name)
          return "Hello, " .. name .. "!";
      end
  }

  UniChatAPI:expose_module("greeting", my_module);

  -- In another plugin/or the same plugin:
  local greeting = require("my_plugin:greeting");
  print(greeting.greet("World"));  -- Output: Hello, World!
  ```

- `UniChatAPI:add_event_listener(callback)`: Adiciona um ouvinte de eventos emitidos pelo **UniChat**.
  | Argumento | Tipo       | Obrigatório | Descrição                                                                                        |
  |-----------|------------|-------------|--------------------------------------------------------------------------------------------------|
  | callback  | `function` | SIM         | Função de callback que recebe um [`UniChatEvent`](pt-br/widgets/events), não deve retornar nada. |

  Exemplo de uso:
  ```lua
  local function on_event(event)
      -- Handle the event here.
  end

  local listener_id = UniChatAPI:add_event_listener(on_event);

  -- To remove the event listener later, you can use the listener_id returned.
  UniChatAPI:remove_event_listener(listener_id);
  ```

- `UniChatAPI:remove_event_listener(listener_id)`: Remove um ouvinte de eventos previamente adicionado.
  | Argumento   | Tipo     | Obrigatório | Descrição                                       |
  |-------------|----------|-------------|-------------------------------------------------|
  | listener_id | `number` | SIM         | ID do ouvinte retornado por add_event_listener. |

  Exemplo de uso:
  ```lua
  local function on_event(event)
  end

  local listener_id = UniChatAPI:add_event_listener(on_event);

  -- To remove the event listener later, you can use the listener_id returned.
  UniChatAPI:remove_event_listener(listener_id);
  ```

- `UniChatAPI:get_userstore_item(key)`: Obtém um item do userstore.
  | Argumento | Tipo     | Obrigatório | Descrição                     |
  |-----------|----------|-------------|-------------------------------|
  | key       | `string` | SIM         | Chave do item a ser obtido.   |

  Esta função retorna o valor do item (sempre do tipo `string`) ou `nil` se o item não existir.

  Exemplo de uso:
  ```lua
  local value = UniChatAPI:get_userstore_item("my_key");
  if value then
      print("Value:", value);
  else
      print("Item not found.");
  end
  ```

- `UniChatAPI:set_userstore_item(key, value)`: Define um item no userstore.
  | Argumento | Tipo              | Obrigatório | Descrição                     |
  |-----------|-------------------|-------------|-------------------------------|
  | key       | `string`          | SIM         | Chave do item a ser definido. |
  | value     | `string` ou `nil` | SIM         | Valor do item a ser definido. |

  Exemplo de uso:
  ```lua
  UniChatAPI:set_userstore_item("my_key", "my_value"); -- Now `my_key` is set to `my_value`
  UniChatAPI:set_userstore_item("my_key", nil); -- Now `my_key` is removed from the userstore
  ```

- `UniChatAPI:notify(message)`: Exibe uma notificação no **UniChat**.
  | Argumento | Tipo     | Obrigatório | Descrição                     |
  |-----------|----------|-------------|-------------------------------|
  | message   | `string` | SIM         | Mensagem da notificação.      |

  Exemplo de uso:
  ```lua
  UniChatAPI:notify("This is a notification from my plugin!");
  -- A notification will appear in the UniChat UI with title `<plugin_name>` and the provided message.
  ```
