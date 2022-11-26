const AccountFooter = ({onClose, handleSignout, supportAddress = ''}) => {
    const supportAddressMail = `mailto:${supportAddress}`;
    return (
        <footer className='gh-portal-account-footer'>
            <ul className='gh-portal-account-footermenu'>
                <li><button className='gh-portal-btn' name='logout' aria-label='logout' onClick={e => handleSignout(e)}>ログアウト</button></li>
            </ul>
        </footer>
    );
};

export default AccountFooter;
