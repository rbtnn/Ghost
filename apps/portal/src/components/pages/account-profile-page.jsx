import React from 'react';
import AppContext from '../../app-context';
import MemberAvatar from '../common/member-gravatar';
import ActionButton from '../common/action-button';
import CloseButton from '../common/close-button';
import BackButton from '../common/back-button';
import InputForm from '../common/input-form';
import { ValidateInputForm } from '../../utils/form';
import { t } from '../../utils/i18n';
import MemberCustomFields from '../common/member-custom-fields';
import { changedCustomFields, drawableCustomFields } from '../../utils/custom-fields';

export default class AccountProfilePage extends React.Component {
  static contextType = AppContext;

  constructor(props, context) {
    super(props, context);
    const { name = '', email = '', metafields } = context.member || {};
    this.state = {
      name,
      email,
      metafields: metafields?.custom || {},
      // Incremented after a Gravatar avatar update so the (unchanged, email-derived)
      // avatar URL is re-fetched with a cache-busting timestamp.
      avatarRevision: 0,
    };
    // Lazily-created Gravatar Quick Editor core instance.
    this.quickEditor = null;
  }

  componentWillUnmount() {
    // The Gravatar Quick Editor core binds a window 'message' listener; there is no
    // public destroy method on the class, but letting the instance go out of scope
    // after unmount keeps the feature self-contained.
    this.quickEditor = null;
  }

  componentDidMount() {
    const { member } = this.context;
    if (!member) {
      this.context.doAction('switchPage', {
        page: 'signin',
      });
    }
  }

  handleSignout(e) {
    e.preventDefault();
    this.context.doAction('signout');
  }

  onBack() {
    this.context.doAction('back');
  }

  onProfileSave(e) {
    e.preventDefault();
    this.setState(
      (state) => {
        return {
          errors: ValidateInputForm({ fields: this.getInputFields({ state }) }),
        };
      },
      () => {
        const { email, name, errors } = this.state;
        const hasFormErrors = errors && Object.values(errors).filter((d) => !!d).length > 0;
        if (!hasFormErrors) {
          this.context.doAction('clearPopupNotification');
          const metafields = changedCustomFields(
            this.customFields(),
            this.state.metafields,
            this.context.member.metafields?.custom || {},
          );
          this.context.doAction('updateProfile', {
            email,
            name,
            ...(metafields ? { metafields } : {}),
          });
        }
      },
    );
  }

  renderSaveButton() {
    const isRunning = this.context.action === 'updateProfile:running';
    let label = t('Save');
    if (this.context.action === 'updateProfile:failed') {
      label = t('Retry');
    }
    const disabled = isRunning ? true : false;
    return (
      <ActionButton
        dataTestId={'save-button'}
        isRunning={isRunning}
        onClick={(e) => this.onProfileSave(e)}
        disabled={disabled}
        brandColor={this.context.brandColor}
        label={label}
        style={{ width: '100%' }}
      />
    );
  }

  renderDeleteAccountButton() {
    return (
      <div style={{ cursor: 'pointer', color: 'red' }} role="button">
        {t('Delete account')}
      </div>
    );
  }

  renderAccountFooter() {
    return <footer className="gh-portal-action-footer">{this.renderSaveButton()}</footer>;
  }

  renderHeader() {
    return (
      <header className="gh-portal-detail-header">
        <BackButton
          brandColor={this.context.brandColor}
          hidden={!this.context.lastPage}
          onClick={(e) => this.onBack(e)}
        />
        <h3 className="gh-portal-main-title">{t('Account settings')}</h3>
      </header>
    );
  }

  renderUserAvatar() {
    const avatarImg = this.context.member && this.context.member.avatar_image;
    const { avatarRevision } = this.state;

    // The member avatar URL is derived from the member email and therefore does not
    // change when the Gravatar is edited. Add a cache-busting timestamp so the
    // freshly-edited avatar is fetched after an update.
    const bustedAvatar =
      avatarImg && avatarRevision > 0
        ? `${avatarImg}${avatarImg.includes('?') ? '&' : '?'}t=${avatarRevision}`
        : avatarImg;

    // Render the avatar directly via MemberAvatar (as the account home header does);
    // the gravatar figure itself is the circular clip, so the image always fills and
    // centres within its circular frame. A dedicated outer wrapper would introduce a
    // second, misaligned ring.
    return (
      <MemberAvatar
        gravatar={bustedAvatar}
        style={{ userIcon: { color: 'black', width: '56px', height: '56px' } }}
      />
    );
  }

  /**
   * Lazily create a Gravatar Quick Editor core bound to the signed-in member's email.
   * The popup lets members edit their Gravatar (avatar) from within the portal.
   */
  async getQuickEditor() {
    if (!this.quickEditor) {
      const { GravatarQuickEditorCore } = await import('@gravatar-com/quick-editor');
      const email = this.context.member && this.context.member.email;
      this.quickEditor = new GravatarQuickEditorCore({
        email,
        scope: ['avatars'],
        locale: this.context.locale || undefined,
        onProfileUpdated: (type) => {
          if (type === 'avatar_updated') {
            this.setState(({ avatarRevision }) => ({
              avatarRevision: Number(avatarRevision || 0) + 1,
            }));
          }
        },
      });
    }
    return this.quickEditor;
  }

  async handleEditAvatar(e) {
    e.preventDefault();
    e.stopPropagation();
    const editor = await this.getQuickEditor();
    editor.open();
  }

  renderAvatarEditor() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        {this.renderUserAvatar()}
        <button
          type="button"
          className="gh-portal-btn gh-portal-btn-text"
          data-testid="edit-avatar-button"
          onClick={(e) => this.handleEditAvatar(e)}
          style={{ cursor: 'pointer', fontSize: '13px' }}
        >
          {t('Edit avatar')}
        </button>
      </div>
    );
  }

  handleInputChange(e, field) {
    this.setState({
      [field.name]: e.target.value,
    });
  }

  handleCustomFieldChange(field, part, value) {
    this.setState(({ metafields }) => ({
      metafields: {
        ...metafields,
        [field.key]: part ? { ...(metafields[field.key] || {}), [part]: value } : value,
      },
    }));
  }

  /** The opened fields this build can draw. */
  customFields() {
    return drawableCustomFields(this.context.customFields);
  }

  getInputFields({ state, fieldNames }) {
    const errors = state.errors || {};
    const fields = [
      {
        type: 'text',
        value: state.name,
        placeholder: t('Jamie Larson'),
        label: t('Name'),
        name: 'name',
        required: false,
        errorMessage: errors.name || '',
      },
      {
        type: 'email',
        value: state.email,
        placeholder: t('jamie@example.com'),
        label: t('Email'),
        name: 'email',
        required: true,
        errorMessage: errors.email || '',
      },
    ];
    if (fieldNames && fieldNames.length > 0) {
      return fields.filter((f) => {
        return fieldNames.includes(f.name);
      });
    }
    return fields;
  }

  onKeyDown(e) {
    // Handles submit on Enter press
    if (e.keyCode === 13) {
      this.onProfileSave(e);
    }
  }

  renderProfileData() {
    const customFields = this.customFields();
    return (
      <div className="gh-portal-section">
        <InputForm
          fields={this.getInputFields({ state: this.state })}
          onChange={(e, field) => this.handleInputChange(e, field)}
          onKeyDown={(e, field) => this.onKeyDown(e, field)}
        />
        {customFields.length > 0 && (
          <MemberCustomFields
            errors={this.context.fieldErrors || {}}
            fields={customFields}
            onChange={(field, part, value) => this.handleCustomFieldChange(field, part, value)}
            onKeyDown={(e) => this.onKeyDown(e)}
            values={this.state.metafields}
          />
        )}
      </div>
    );
  }

  render() {
    const { member } = this.context;
    if (!member) {
      return null;
    }
    return (
      <>
        <div className="gh-portal-content with-footer">
          {this.renderHeader()}
          <CloseButton />
          {this.renderAvatarEditor()}
          <div className="gh-portal-section">{this.renderProfileData()}</div>
        </div>
        {this.renderAccountFooter()}
      </>
    );
  }
}
