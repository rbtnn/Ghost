import AppContext from 'AppContext';
import ActionButton from 'components/common/ActionButton';
import {getMemberSubscription} from 'utils/helpers';
import {getDateString, getDateStringJa} from 'utils/date-time';
import {useContext} from 'react';

const ContinueSubscriptionButton = () => {
    const {member, onAction, action, brandColor} = useContext(AppContext);
    const subscription = getMemberSubscription({member});
    if (!subscription) {
        return null;
    }

    // To show only continue button and not cancellation
    if (!subscription.cancel_at_period_end) {
        return null;
    }
    const label = subscription.cancel_at_period_end ? '購読継続' : '購読停止';
    const isRunning = ['cancelSubscription:running'].includes(action);
    const disabled = (isRunning) ? true : false;
    const isPrimary = !!subscription.cancel_at_period_end;

    const CancelNotice = () => {
        if (!subscription.cancel_at_period_end) {
            return null;
        }
        const currentPeriodEnd = subscription.current_period_end;
        return (
            <p className='gh-portal-text-center gh-portal-free-ctatext'>あなたの購読は{getDateStringJa(currentPeriodEnd)}で期限切れになります</p>
        );
    };

    return (
        <div className='gh-portal-cancelcontinue-container'>
            <CancelNotice />
            <ActionButton
                onClick={(e) => {
                    onAction('continueSubscription', {
                        subscriptionId: subscription.id
                    });
                }}
                isRunning={isRunning}
                disabled={disabled}
                isPrimary={isPrimary}
                brandColor={brandColor}
                label={label}
                style={{
                    width: '100%'
                }}
            />
        </div>
    );
};

export default ContinueSubscriptionButton;
