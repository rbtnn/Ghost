import ActionButton from '../common/ActionButton';
import CloseButton from '../common/CloseButton';
import AppContext from '../../AppContext';
import {ReactComponent as EnvelopeIcon} from '../../images/icons/envelope.svg';

const React = require('react');

export const MagicLinkStyles = `
    .gh-portal-icon-envelope {
        width: 44px;
        margin: 12px 0 10px;
    }

    .gh-portal-inbox-notification {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .gh-portal-inbox-notification p {
        text-align: center;
        margin-bottom: 30px;
    }
`;

export default class MagicLinkPage extends React.Component {
    static contextType = AppContext;

    renderFormHeader() {
        let popupTitle = `マジックリンクを送りました！`;
        let popupDescription = `もし３分以内にメールが届いてないのならスパムフォルダをチェックしてみてください！`;

        if (this.context.lastPage === 'signup') {
            popupTitle = `メールを確認してください！`;
            popupDescription = `BSMの購読を完了したため、メールの認証リンクをクリックしてください。 もし３分以内にメールが届いてないのならスパムフォルダをチェックしてみてください！`;
        }

        return (
            <section className='gh-portal-inbox-notification'>
                <header className='gh-portal-header'>
                    <EnvelopeIcon className='gh-portal-icon gh-portal-icon-envelope' />
                    <h2 className='gh-portal-main-title'>{popupTitle}</h2>
                </header>
                <p>{popupDescription}</p>
            </section>
        );
    }

    renderLoginMessage() {
        const {t} = this.context;

        return (
            <>
                <div
                    style={{color: '#1d1d1d', fontWeight: 'bold', cursor: 'pointer'}}
                    onClick={() => this.context.onAction('switchPage', {page: 'signin'})}
                >
                    {t('Back to Log in')}
                </div>
            </>
        );
    }

    handleClose(e) {
        this.context.onAction('closePopup');
    }

    renderCloseButton() {
        const label = '閉じる';
        return (
            <ActionButton
                style={{width: '100%'}}
                onClick={e => this.handleClose(e)}
                brandColor={this.context.brandColor}
                label={label}
            />
        );
    }

    render() {
        return (
            <div className='gh-portal-content'>
                <CloseButton />
                {this.renderFormHeader()}
                {this.renderCloseButton()}
            </div>
        );
    }
}
