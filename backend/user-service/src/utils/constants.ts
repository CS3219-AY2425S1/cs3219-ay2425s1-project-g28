export const ACCOUNT_VERIFICATION_SUBJ = "Account Verification Link";

export const ACCOUNT_VERIFICATION_TEMPLATE = `
<html>
  <head>
    <title>Account Verification</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <p>Hello {{username}}!</p>
    <p>
      Thank you for signing up with us. Please verify your email address using this token: <strong>{{token}}</strong>.
    </p>
    <p>If you did not sign up with us, please ignore this email.</p>
    <p>Regards,</p>
    <p>Peerprep G28</p>
  </body>
</html>
`;

export const RESET_PASSWORD_SUBJ = "Password Reset Link";

export const RESET_PASSWORD_TEMPLATE = `
<html>
  <head>
    <title>Password Reset</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <p>Hello {{username}}!</p>
    <p>
      You have requested to reset your password. Please use this token: <strong>{{token}}</strong> to reset your password.
    </p>
    <p>If you did not request for a password reset, please ignore this email.</p>
    <p>Regards,</p>
    <p>Peerprep G28</p>
  </body>
</html>
`;
