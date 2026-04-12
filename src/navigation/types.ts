export type RootStackParamList = {
  Login: undefined;
  DispatcherFlow: undefined;
  AmbulanceFlow: undefined;
  HospitalFlow: undefined;
  FamilyFlow: undefined;
};

export type DispatcherStackParamList = {
  DispatcherTabs: undefined;
  CaseDetail: { caseId: string };
};

export type DispatcherTabParamList = {
  Home: undefined;
  Map: undefined;
  Cases: undefined;
  Settings: undefined;
};

export type AmbulanceTabParamList = {
  Navigate: undefined;
  Settings: undefined;
};

export type HospitalTabParamList = {
  Beds: undefined;
  Incoming: undefined;
  Settings: undefined;
};

export type FamilyTabParamList = {
  Track: undefined;
  Settings: undefined;
};
