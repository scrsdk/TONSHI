import store from "../store/index.js";

export default async (title = null, callback = null, buttons = null) => {
    const donation_helper = store.state.donation_helper;
    if (
        donation_helper.closeAnimation ||
        (
            !donation_helper.active &&
            (
                !title ||
                !callback ||
                !buttons
            )
        )
    ) return;
    if (!donation_helper.active) {
        await store.dispatch('setDonationHelperActive', true);
        await store.dispatch('setDonationHelperTitle', title);
        await store.dispatch('setDonationHelperCallback', callback);
        for (const button of buttons)
        {
            await store.dispatch('addDonationHelperButtons', {
                type: button.type, text: button.text,
            });
        }
    } else {
        await store.dispatch('setDonationHelperCloseAnimation', true);
        setTimeout(() => {
            store.dispatch('setDonationHelperActive', false);
            store.dispatch('setDonationHelperTitle', null);
            store.dispatch('clearDonationHelperButtons', null);
            store.dispatch('setDonationHelperCallback', null);
            store.dispatch('setDonationHelperCloseAnimation', false);
        }, 200);
    }
}
