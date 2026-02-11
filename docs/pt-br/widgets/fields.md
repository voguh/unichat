# Propriedades do `fields.json`

#### Campo `text` ou `textarea`

São substituídos como strings normais.

| Parâmetro     | Tipo                     | Obrigatório | Descrição          |
|---------------|--------------------------|-------------|--------------------|
| `type`        | `"text"` ou `"textarea"` | SIM         | Tipo do campo      |
| `group`       | `string`                 | NÃO         | Grupo do campo     |
| `label`       | `string`                 | SIM         | Rótulo do campo    |
| `description` | `string`                 | NÃO         | Descrição do campo |
| `value`       | `string`                 | NÃO         | Valor padrão       |

#### Campo `number`

São substituídos como números normais.

| Parâmetro     | Tipo       | Obrigatório | Descrição          |
|---------------|------------|-------------|--------------------|
| `type`        | `"number"` | SIM         | Tipo do campo      |
| `group`       | `string`   | NÃO         | Grupo do campo     |
| `label`       | `string`   | SIM         | Rótulo do campo    |
| `description` | `string`   | NÃO         | Descrição do campo |
| `value`       | `number`   | NÃO         | Valor padrão       |
| `min`         | `number`   | NÃO         | Valor mínimo       |
| `max`         | `number`   | NÃO         | Valor máximo       |
| `step`        | `number`   | NÃO         | Incremento         |

#### Campo `checkbox`

São substituídos como booleanos normais.

| Parâmetro     | Tipo                     | Obrigatório | Descrição          |
|---------------|--------------------------|-------------|--------------------|
| `type`        | `"checkbox"`             | SIM         | Tipo do campo      |
| `group`       | `string`                 | NÃO         | Grupo do campo     |
| `label`       | `string`                 | SIM         | Rótulo do campo    |
| `description` | `string`                 | NÃO         | Descrição do campo |
| `value`       | `boolean`                | NÃO         | Valor padrão       |

#### Campo `colorpicker`

São substituídos como strings normais representando cores em formato hexadecimal.

| Parâmetro        | Tipo                     | Obrigatório | Descrição                                        |
|------------------|--------------------------|-------------|--------------------------------------------------|
| `type`           | `"colorpicker"`          | SIM         | Tipo do campo                                    |
| `group`          | `string`                 | NÃO         | Grupo do campo                                   |
| `label`          | `string`                 | SIM         | Rótulo do campo                                  |
| `description`    | `string`                 | NÃO         | Descrição do campo                               |
| `value`          | `string`                 | NÃO         | Valor padrão                                     |
| `swatches`      | `string[]`                | NÃO         | Cores predefinidas para seleção rápida           |

#### Campo `dropdown`

São substituídos como strings normais.

| Parâmetro        | Tipo                     | Obrigatório | Descrição          |
|------------------|--------------------------|-------------|--------------------|
| `type`           | `"dropdown"`             | SIM         | Tipo do campo      |
| `group`          | `string`                 | NÃO         | Grupo do campo     |
| `label`          | `string`                 | SIM         | Rótulo do campo    |
| `description`    | `string`                 | NÃO         | Descrição do campo |
| `value`          | `string`                 | NÃO         | Valor padrão       |
| `options`        | `Record<string, string>` | SIM         | Opções disponíveis |

#### Campo `filepicker`

São substituídos por strings normais que representam a URL do arquivo selecionado.

| Parâmetro        | Tipo                                          | Obrigatório | Descrição                   |
|------------------|-----------------------------------------------|-------------|-----------------------------|
| `type`           | `"filepicker"`                                | SIM         | Tipo do campo               |
| `group`          | `string`                                      | NÃO         | Grupo do campo              |
| `label`          | `string`                                      | SIM         | Rótulo do campo             |
| `description`    | `string`                                      | NÃO         | Descrição do campo          |
| `value`          | `string`                                      | NÃO         | Valor padrão                |
| `fileType`       | `("image" \| "video" \| "audio" \| "file")[]` | NÃO         | Tipos de arquivo permitidos |

!> Este campo tem integração à galeria de mídia interna do **UniChat**, permitindo selecionar arquivos já enviados ou fazer upload de novos arquivos ou utilizar URLs externas.
