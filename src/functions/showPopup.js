import store from "~/store/index.js";
import {uuid} from "vue-uuid";

export default (type, message, title = null, timeout = 3000) => {
    return store.dispatch('notifications/addItemNotificationsPopup', {
        id: uuid.v4(),
        timeout: timeout,
        type, message,
        ...(title && {title})
    })
}