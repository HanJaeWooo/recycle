export type RootStackParamList = {
  Landing: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Main: undefined; // Bottom tabs
  IdeaDetail: { id: string };
  Guides: undefined;
  MaterialGuide: { materialKey: string };
  Profile: undefined;
  AllMaterials: undefined;
  YouTubeVideoList: { material: string; projectTitle?: string };
  ProjectHistory: undefined;
};

export type TabParamList = {
  Home: undefined;
  Capture: undefined;
  Library: { material?: string } | undefined;
  History: undefined;
  Inventory: undefined;
  Settings: undefined;
};


