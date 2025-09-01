import store from "~/store/index.js";

export default async (name = null, props = null) => {
    const windowContent = store.state.window
    if (!windowContent.active && !name) return;
    if (windowContent.active) {
        if (name && name !== windowContent.selected) {
            if (props) store.dispatch('window/setWindowProps', props)
            store.dispatch('window/setWindowActive', name)
        } else store.dispatch('window/setWindowActive')
    } else {
        if (props) {
            await store.dispatch('window/setWindowProps', props)
        }
        await store.dispatch('window/setWindowActive', name)
    }
}