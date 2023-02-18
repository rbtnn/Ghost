import AppContext from 'AppContext';
import {useContext} from 'react';
import BackButton from 'components/common/BackButton';
import CloseButton from 'components/common/CloseButton';
import {getDefaultNewsletterSender, getSupportAddress} from 'utils/helpers';

export default function EmailReceivingPage() {
    const {brandColor, onAction, site, lastPage, member} = useContext(AppContext);

    const supportAddressEmail = getSupportAddress({site});
    const supportAddress = `mailto:${supportAddressEmail}`;
    const defaultNewsletterSenderEmail = getDefaultNewsletterSender({site});
    return (
        <div className="gh-email-receiving-faq">
            <header className='gh-portal-detail-header'>
                <BackButton brandColor={brandColor} onClick={() => {
                    if (!lastPage) {
                        onAction('switchPage', {page: 'accountEmail', lastPage: 'accountHome'});
                    } else {
                        onAction('switchPage', {page: 'accountHome'});
                    }
                }} />
                <CloseButton />
            </header>

            <div class="gh-longform">
                <h3>助けて！メールが受信できない</h3>

                <p>もし購読したメール通知が受信できない場合、以下の点を確認してください。</p>

                <h4>メールアドレスが正しいか確認</h4>

                <p>貴方のメールアドレスは<strong>{member.email}</strong>です。 もしこれが正しくない場合、<button className="gh-portal-btn-text" onClick={() => onAction('switchPage', {lastPage: 'emailReceivingFAQ', page: 'accountProfile'})}>アカウント設定</button>からメールアドレスを設定できます。</p>

                <h4>迷惑メールやプロモーションフォルダの確認</h4>

                <p>メールが誤って受信トレイの迷惑メールやプロモーションフォルダに入っていないことを確認してください。そうである場合は、[スパムではないとしてマークする] および/または [受信トレイに移動] をクリックします。</p>

                <h4>連絡先リストに追加</h4>

                <p>メールクライアントの連絡先リストに<strong>{defaultNewsletterSenderEmail}</strong>を追加します。 これはこのアドレスから送信されたメールが信頼できるものであることをメールプロバイダーに知らせます。</p>

                <h4>メールの送信</h4>

                <p><strong>{defaultNewsletterSenderEmail}</strong>にメールを送信します。 これは、このアドレスとの間のメールが信頼できるものであることをメールプロバイダーに知らせるのにも役立ちます。</p>

                <h4>自身のメールプロバイダーの確認</h4>

                <p>企業または政府のメールアカウントをお持ちの場合は、IT部門に連絡して、<strong>{defaultNewsletterSenderEmail}</strong>からのメールの受信を許可するよう依頼してください。</p>

                <h4>もしそれでも解決しないなら</h4>

                <p>これらのチェックをすべて完了してもメールが届かない場合は、<a href={supportAddress} onClick={() => {
                    supportAddress && window.open(supportAddress);
                }}>{supportAddressEmail}</a>に連絡してサポートを受けることができます。</p>
            </div>
        </div>
    );
}
