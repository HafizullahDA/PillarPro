export type SignUpFormValues = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
};

export type SignInFormValues = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export const emptySignUpFormValues: SignUpFormValues = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
};

export const emptySignInFormValues: SignInFormValues = {
  email: "",
  password: "",
};
