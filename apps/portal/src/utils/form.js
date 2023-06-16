import * as Validator from './validator';

export const FormInputError = ({field}) => {
    if (field.required && !field.value) {
        switch (field.name) {
        case 'name':
            return `名前を入力してください`;
        
        case 'email':
            return `メールアドレスを入力してください`;

        default:
            return `Please enter ${field.name}`;
        }
    }

    if (field.type === 'email' && !Validator.isValidEmail(field.value)) {
        return `メールアドレスが不正です`;
    }
    return null;
};

export const ValidateInputForm = ({fields}) => {
    const errors = {};
    fields.forEach((field) => {
        const name = field.name;
        const fieldError = FormInputError({field});
        errors[name] = fieldError;
    });
    return errors;
};
