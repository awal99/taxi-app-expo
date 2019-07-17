import { createStackNavigator,createAppContainer,createSwitchNavigator } from 'react-navigation';
import SignUp from '../src/components/SignUp';
import LoginForm from '../src/components/Login';
import Home from '../src/components/Home';
import AuthLoading from '../src/components/AuthLoading'
import PasswordReset from '../src/components/passwordReset';
import VerifyEmail from '../src/components/VerifyEmail';
import ProfileView from '../src/components/Profile';
import Rides from '../src/components/Rides';
import Request from '../src/components/Request'


const MainNavigator = createSwitchNavigator({
  Auth: {screen: LoginForm,navigationOptions:{header:null}},
  Home: {screen: Home,
    navigationOptions: {
      header: null,
    },
  }, 
  SignUp: {
    screen: SignUp,
    navigationOptions: {
      header: null,
    },
  },
  Rides: {
    screen: Rides,
    navigationOptions: {
      header: null,
    },
  },
  Request: {
    screen: Request,
    navigationOptions: {
      header: null,
    },
  },
  ProfileView: {
    screen: ProfileView,
    navigationOptions: {
      header: null,
    },
  },
  PasswordReset: {
    screen: PasswordReset,
    navigationOptions: {
      header: null,
    },
  },
  VerifyEmail: {
    screen: VerifyEmail,
    navigationOptions: {
      header: null,
    },
  },
  AuthLoading: {
      screen: AuthLoading,
      navigationOptions: {
        header: null,
      },
    },
  },
    {
    initialRouteName: 'AuthLoading',
   
  });
  
 export const AppContainer = createAppContainer(MainNavigator);