const AccountFooter = ({onClose, handleSignout, supportAddress = ''}) => {
    return (
        <footer className='gh-portal-account-footer'>
            <ul className='gh-portal-account-footermenu'>
                <li>
                    <button data-test-button="footer-signout" className='gh-portal-btn' name='logout' aria-label='logout' onClick={e => handleSignout(e)}>
                        ログアウト
                    </button>
                </li>
            </ul>
        </footer>
    );
};

export default AccountFooter;
