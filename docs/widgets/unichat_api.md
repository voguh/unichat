# Widget UniChat API

In the widget environment, you will have access to the **UniChat** API through the global `UniChatAPI` object.

---

### UniChatAPI.getUserstoreItem(key)

Gets an item from the userstore.
This function returns the item value (always of type `string`) or `null` if the item does not exist.

| Argument | Type     | Description                  |
|----------|----------|------------------------------|
| `key`    | `string` | Key of the item to retrieve. |

Example usage:
```javascript
const userPreference = UniChatAPI.getUserstoreItem('preferenceKey');
if (userPreference !== null) {
    console.log('User preference:', userPreference);
} else {
    console.log('No preference found for the given key.');
}
```
