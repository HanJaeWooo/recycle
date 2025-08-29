// Centralized image mapping to local assets. Paths are relative to this file.

export const images = {
  appLogo: {
    bgLogo: require('../../assets/bgLogo.png'),
    bgOfLogin: require('../../assets/bgOfLogin.png'),
    bgOfReg: require('../../assets/bgOfReg.png'),
    topLogo: require('../../assets/topLogo.png'),
    camButton: require('../../assets/camButton.png'),
    flash: require('../../assets/flash.png'),
    leftArrow: require('../../assets/leftArrow.png'),
    leftArrow2: require('../../assets/LeftArrow2.png'),
    setIcon: require('../../assets/setIcon.png'),
    history: require('../../assets/history.png'),
    box: require('../../assets/box.png'),
  },
  settings: {
    aboutUs: require('../../assets/aboutUs.png'),
    guides: require('../../assets/guides.png'),
    iconSet1: require('../../assets/IconSet1.png'),
    iconSet2: require('../../assets/IconSet2.png'),
    iconSet3: require('../../assets/IconSet3.png'),
    iconSet4: require('../../assets/IconSet4.png'),
    logout: require('../../assets/logout.png'),
    myProfile: require('../../assets/MyProfile.png'),
    switchAcc: require('../../assets/switchAcc.png'),
  },
  guidePages: {
    page1: require('../../assets/page1.png'),
    page2: require('../../assets/page2.png'),
    page3: require('../../assets/page3.png'),
    page5: require('../../assets/page5.png'),
  },
  projectIdeas: {
    WDI1: require('../../assets/WDI1.png'),
    WPI2: require('../../assets/WPI2.png'),
    WPI3: require('../../assets/WPI3.png'),
    WPI4: require('../../assets/WPI4.png'),
    WPI5: require('../../assets/WPI5.png'),
    WPI6: require('../../assets/WPI6.png'),
    WPI7: require('../../assets/WPI7.png'),
  },
} as const;

export type Images = typeof images;


