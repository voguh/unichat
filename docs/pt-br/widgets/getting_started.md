# Guia de Desenvolvimento de Widgets

### Tabela de Conteúdos
- [Introdução](#introdução)
- [Estrutura de um widget](#estrutura-de-um-widget)

### Extra
- [Eventos](/pt-br/widgets/events)
- [Propriedades do `fields.json`](/pt-br/widgets/fields)

---

## Introdução

Os widgets do **UniChat** são completamente customizáveis e escritos em HTML, CSS e JavaScript.
Eles podem prover seus próprios assets, como imagens, fontes, audios.

- Os widgets já possuem o `jquery` na versão 3.7.1 incluído por padrão.
- Os widgets já possuem o `normalize.css` na versão 8.0.1 incluído por padrão.
- Os widgets já possuem o `animate.css` na versão 4.1.1 incluído por padrão.

---

## Estrutura de um widget

Os widgets podem ser instalados na pasta `widgets/` do **UniChat** localizada em:
- Windows: `%LOCALAPPDATA%\unichat\widgets\`
- Linux: `~/.local/share/unichat/widgets/`

Então, a estrutura de pastas de um widget típico é a seguinte:
```
widget-example
├── assets (opcional)
├── fields.json (opcional)
├── index.html (obrigatório)
├── script.js (obrigatório)
└── style.css (obrigatório)
```

!> O nome da pasta do widget deve conter apenas caracteres ASCII alfanuméricos, hífens ou underscores.

---

### Pasta `assets/`

Esta pasta é opcional e tem o objetivo de prover arquivos estáticos. Eles podem ser acessados via URL `http://localhost:9527/widget/{widget-name}/assets/{asset-path}`.

---

### Arquivo `fields.json`

Este arquivo é utilizado pelo editor de widgets para ativar customizações. Ele possui a sintaxe parecida com o `fields` do StreamElements, facilitando a criação de widgets para quem já está acostumado com aquela plataforma.

- Todas as referencias às chaves definidas no `fields.json` escritas nos arquivos `index.html`, `script.js` e `style.css` seguindo o padrão `{{key}}` serão substituídas pelos valores padrões ou definidos pelo usuário no editor de widgets do UniChat.
- O schema pode ser encontrado [aqui](https://github.com/voguh/unichat/blob/main/widgets/fields-schema.json).
- A documentação para cada tipo de campo pode ser encontrada [aqui](/pt-br/widgets/fields).

Exemplo de arquivo `fields.json`:
```json
{
    "$schema": "https://cdn.statically.io/gh/voguh/unichat/1.3.1/widgets/fields-schema.json",
    "checkboxProperty": {
        "type": "checkbox",
        "label": "I'm a checkbox",
        "description": "This is a checkbox property",
        "value": true
    },
    "colorpickerProperty": {
        "type": "colorpicker",
        "label": "I'm a color picker",
        "description": "This is a color picker property with only swatches",
        "value": "#ff0000",
        "withPickerFree": false,
        "swatches": [
            "#000000",
            "#800000",
            "#008000",
            "#808000",
            "#000080",
            "#800080",
            "#008080",
            "#c0c0c0",
            "#808080",
            "#ff0000",
            "#00ff00",
            "#ffff00",
            "#0000ff",
            "#ff00ff",
            "#00ffff",
            "#ffffff"
        ]
    },
    "dividerProperty": {
        "type": "divider"
    },
    "dropdownProperty": {
        "type": "dropdown",
        "label": "I'm a dropdown",
        "description": "This is a dropdown property",
        "value": "option3",
        "options": {
            "option1": "Option 1",
            "option2": "Option 2",
            "option3": "Option 3"
        }
    },
    "numberProperty": {
        "type": "number",
        "label": "I'm a number input",
        "description": "This is a number input property",
        "value": 42,
        "min": 0,
        "max": 100,
        "step": 1
    },
    "sliderProperty": {
        "type": "slider",
        "label": "I'm a slider",
        "description": "This is a slider property",
        "value": 50,
        "min": 0,
        "max": 100,
        "step": 1
    },
    "textProperty": {
        "type": "text",
        "label": "I'm a text input",
        "description": "This is a text input property",
        "value": "Hello, World!"
    },
    "textareaProperty": {
        "type": "textarea",
        "label": "I'm a textarea",
        "description": "This is a textarea property",
        "value": "This is a longer piece of text.\nIt can span multiple lines."
    },
    "sfxUrl": {
        "type": "filepicker",
        "label": "Sound effect",
        "value": "https://www.myinstants.com/media/sounds/america-ya-hallo.mp3",
        "fileType": ["audio"]
    }
}

```

!> Quando alguma propriedade é editada no editor de widgets, um arquivo `fieldstate.json` é gerado na pasta do widget contendo os valores atuais definidos pelo usuário.

---

### Arquivo `index.html`

Assim como os widgets customizados do StreamElements, este arquivo é o ponto de entrada para a parte grafica do widget.

- Este arquivo não deve conter nenhuma tag extra, apenas o conteúdo dentro do `<body>`.
- Não é necessário incluir tags `<script>` ou `<link>` para os arquivos `script.js` e `style.css`, eles serão injetados automaticamente.
- Você pode utilizar outras tags `<script>` ou `<link>` para incluir bibliotecas externas, como o fontes.

---

### Arquivo `script.js`
Este arquivo é obrigatório e deve conter o código JavaScript do widget.
Nesta arquivo você pode escutar alguns eventos de janela (window) disparados pelo UniChat:

- `unichat:connected`: Disparado quando a conexão WebSocket é estabelecida (ou restabelecida).
  ```javascript
  window.addEventListener("unichat:connected", function ({ detail: data }) {
      // ...
  });
  ```

  !> Antes do **UniChat** v1.4.0, nenhum dado de detalhe era passado para o listener do evento.

  | Propriedade | Tipo     | Descrição                               |
  |-------------|----------|-----------------------------------------|
  | `userstore` | `object` | Um mapa chave-valor do userstore atual. |

- `unichat:event`: Disparado quando um novo evento é recebido do **UniChat**.
  ```javascript
  window.addEventListener("unichat:event", function ({ detail: event }) {
      // ...
  });
  ```

  > Detalhe do evento `unichat:event`, o objeto `event` é um objeto [UniChatEvent](/widgets/events).

- `unichat:userstore_update`: (Desde o **UniChat** v1.4.0) Disparado quando o userstore é atualizado.
  ```javascript
  window.addEventListener("unichat:userstore_update", function ({ detail: { key, value } }) {
      // ...
  });
  ```

  | Propriedade | Tipo     | Descrição                                        |
  |-------------|----------|--------------------------------------------------|
  | `key`       | `string` | A chave da entrada do userstore atualizada.      |
  | `value`     | `string` | O novo valor da entrada do userstore atualizada. |

---

### Arquivo `style.css`

Este arquivo é obrigatório e deve conter o código CSS do widget.
