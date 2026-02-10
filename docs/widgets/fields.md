# `fields.json` Properties

#### Field `text` or `textarea`

Are replaced as normal strings.

| Parameter     | Type                     | Required | Description       |
|---------------|--------------------------|----------|-------------------|
| `type`        | `"text"` or `"textarea"` | YES      | Field type        |
| `group`       | `string`                 | NO       | Field group       |
| `label`       | `string`                 | YES      | Field label       |
| `description` | `string`                 | NO       | Field description |
| `value`       | `string`                 | NO       | Default value     |

#### Field `number`

Are replaced as normal numbers.

| Parameter     | Type       | Required | Description       |
|---------------|------------|----------|-------------------|
| `type`        | `"number"` | YES      | Field type        |
| `group`       | `string`   | NO       | Field group       |
| `label`       | `string`   | YES      | Field label       |
| `description` | `string`   | NO       | Field description |
| `value`       | `number`   | NO       | Default value     |
| `min`         | `number`   | NO       | Minimum value     |
| `max`         | `number`   | NO       | Maximum value     |
| `step`        | `number`   | NO       | Increment         |

#### Field `checkbox`

Are replaced as normal booleans.

| Parameter     | Type         | Required | Description       |
|---------------|--------------|----------|-------------------|
| `type`        | `"checkbox"` | YES      | Field type        |
| `group`       | `string`     | NO       | Field group       |
| `label`       | `string`     | YES      | Field label       |
| `description` | `string`     | NO       | Field description |
| `value`       | `boolean`    | NO       | Default value     |

#### Field `colorpicker`

Are replaced as normal strings representing colors in hexadecimal format.

| Parameter        | Type            | Required | Description                                  |
|------------------|-----------------|----------|----------------------------------------------|
| `type`           | `"colorpicker"` | YES      | Field type                                   |
| `group`          | `string`        | NO       | Field group                                  |
| `label`          | `string`        | YES      | Field label                                  |
| `description`    | `string`        | NO       | Field description                            |
| `value`          | `string`        | NO       | Default value                                |
| `withPickerFree` | `boolean`       | NO       | Allow free color selection (Default: `true`) |
| `swatches`       | `string[]`      | NO       | Preset colors for quick selection            |

#### Field `dropdown`

Are replaced as normal strings.

| Parameter     | Type                     | Required | Description       |
|---------------|--------------------------|----------|-------------------|
| `type`        | `"dropdown"`             | YES      | Field type        |
| `group`       | `string`                 | NO       | Field group       |
| `label`       | `string`                 | YES      | Field label       |
| `description` | `string`                 | NO       | Field description |
| `value`       | `string`                 | NO       | Default value     |
| `options`     | `Record<string, string>` | YES      | Available options |

#### Field `filepicker`

Are replaced by normal strings representing the URL of the selected file.

| Parameter     | Type                                          | Required | Description        |
|---------------|-----------------------------------------------|----------|--------------------|
| `type`        | `"filepicker"`                                | YES      | Field type         |
| `group`       | `string`                                      | NO       | Field group        |
| `label`       | `string`                                      | YES      | Field label        |
| `description` | `string`                                      | NO       | Field description  |
| `value`       | `string`                                      | NO       | Default value      |
| `fileType`    | `("image" \| "video" \| "audio" \| "file")[]` | NO       | Allowed file types |

!> This field integrates with **UniChat**’s internal media gallery, allowing selection of already uploaded files, uploading new files, or using external URLs.
