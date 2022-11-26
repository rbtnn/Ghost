import AppContext from 'AppContext';
import {useContext} from 'react';
import {isEmailSuppressed} from 'utils/helpers';
import {ReactComponent as EmailDeliveryFailedIcon} from 'images/icons/email-delivery-failed.svg';

function EmailPreferencesAction() {
    const {onAction, member} = useContext(AppContext);
    const emailSuppressed = isEmailSuppressed({member});
    const page = emailSuppressed ? 'emailSuppressed' : 'accountEmail';

    return (
        <section>
            <div className='gh-portal-list-detail'>
                <h3>メール設定</h3>
                {
                    emailSuppressed
                        ? (
                            <p className="gh-portal-email-notice">
                                <EmailDeliveryFailedIcon className="gh-portal-email-notice-icon" />
                                You're currently not receiving emails
                            </p>
                        )
                        : <p>Update your preferences</p>
                }
            </div>
            <button className='gh-portal-btn gh-portal-btn-list' onClick={(e) => {
                onAction('switchPage', {
                    page,
                    lastPage: 'accountHome'
                });
            }}>設定</button>
        </section>
    );
}

export default EmailPreferencesAction;
