# UniChat API dos Widgets

No ambiente do widget, você terá acesso à API do **UniChat** através do objeto global `UniChatAPI`.

---

### UniChatAPI.getUserstoreItem(key)

Obtém um item do userstore.
Esta função assíncrona retorna o valor do item (sempre do tipo `string`) ou `null` se o item não existir.

| Argument | Type     | Description                     |
|----------|----------|---------------------------------|
| `key`    | `string` | Chave do item a ser recuperado. |


Exemplo de uso:
```javascript
const userPreference = await UniChatAPI.getUserstoreItem('preferenceKey');
if (userPreference !== null) {
    console.log('User preference:', userPreference);
} else {
    console.log('No preference found for the given key.');
}
```
