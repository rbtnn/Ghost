import AppContext from 'AppContext';
import {getCompExpiry, getMemberSubscription, hasOnlyFreePlan, isComplimentaryMember, subscriptionHasFreeTrial} from 'utils/helpers';
import {getDateString, getDateStringJa} from 'utils/date-time';
import {useContext} from 'react';

import SubscribeButton from './SubscribeButton';

const AccountWelcome = () => {
    const {member, site} = useContext(AppContext);
    const {is_stripe_configured: isStripeConfigured} = site;

    if (!isStripeConfigured || hasOnlyFreePlan({site})) {
        return null;
    }
    const subscription = getMemberSubscription({member});
    const isComplimentary = isComplimentaryMember({member});
    if (isComplimentary && !subscription) {
        return null;
    }
    if (subscription) {
        const currentPeriodEnd = subscription?.current_period_end;
        if (isComplimentary && getCompExpiry({member})) {
            const expiryDate = getCompExpiry({member});
            const expiryAt = getDateString(expiryDate);
            return (
                <div className='gh-portal-section'>
                    <p className='gh-portal-text-center gh-portal-free-ctatext'>Your subscription will expire on {expiryAt}</p>
                </div>
            );
        }
        if (subscription?.cancel_at_period_end) {
            return null;
        }

        if (subscriptionHasFreeTrial({sub: subscription})) {
            const trialEnd = getDateString(subscription.trial_end_at);
            return (
                <div className='gh-portal-section'>
                    <p className='gh-portal-text-center gh-portal-free-ctatext'>Your subscription will start on {trialEnd}</p>
                </div>
            );
        }
        return (
            <div className='gh-portal-section'>
                <p className='gh-portal-text-center gh-portal-free-ctatext'>あなたの購読は{getDateStringJa(currentPeriodEnd)}に自動的に更新されます</p>
            </div>
        );
    }

    return (
        <div className='gh-portal-section'>
            <p className='gh-portal-text-center gh-portal-free-ctatext'>現在、あなたはメンバー登録をしていますが月契約および年契約はしていません。</p>
            <SubscribeButton />
        </div>
    );
};

export default AccountWelcome;
