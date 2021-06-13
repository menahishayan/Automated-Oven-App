import React, { useEffect, useState, createContext, useReducer, useMemo, useContext } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import profileScreen from './profileScreen'
import historyScreen from './historyScreen'
import mainScreen from './mainScreen'
import energyScreen from './energyScreen'
import automationEditScreen from './automationEditScreen'
import automationScreen from './automationScreen'
import settingsScreen from './settingsScreen'
import { styles, colors } from './styles'
import { TextInput, View, Text, ActivityIndictor } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext(null)

export const stateConditionString = state => {
    if (state.isLoading) return 'LOAD_APP';
    if (state.isSignedIn) return state.userName ? 'LOAD_HOME' : 'LOAD_LOGIN';
};

const NavContainerTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: colors.white,
    },
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const RootStack = createStackNavigator();

function LoginScreen() {
    const [newName, setNewName] = useState("")
    const { login } = useContext(AuthContext);
    return (
        <View >
            <Text>Hi</Text>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Hi</Text>
                <Text style={styles.welcomeText}>Enter your Name</Text>
                <TextInput
                    style={styles.newName}
                    onChangeText={setNewName}
                    onEndEditing={() => login(newName)}
                    value={newName}
                />
            </View>
        </View>
    );
}

function AutomationStack() {
    return (
        <Stack.Navigator initialRouteName="automationScreen" headerMode='none'>
            <Stack.Screen name="automationScreen" component={automationScreen} />
            <Stack.Screen name="automationEdit" component={automationEditScreen} />
        </Stack.Navigator>
    );
}

function mainTabs() {
    return (
        <Tab.Navigator initialRouteName="main"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'automations') {
                        return <IonIcon name="color-wand" size={size+4} color={color} />;
                    } else if (route.name === 'history') {
                        iconName = 'history';
                    } else if (route.name === 'energy') {
                        iconName = 'plug';
                    } else if (route.name === 'settings') {
                        iconName = 'cog';
                    }
                    return <Icon name={iconName} size={size} color={color} solid />;
                },
            })}
            tabBarOptions={{
                activeTintColor: colors.blue,
                showLabel: false,
                inactiveTintColor: colors.navBarInactive,
                style: { borderTopWidth: 0 }
            }}>
            <Tab.Screen name="history" component={historyScreen} />
            <Tab.Screen name="automations" component={AutomationStack} />
            <Tab.Screen name="main"
                options={{
                    tabBarIcon: ({ color }) => (
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 0, // space from bottombar
                                height: 70,
                                width: 70,
                                borderRadius: 35,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: colors.blue,
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 3,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 4.84,
                                elevation: 5,
                            }}
                        >
                            <Icon name="utensils" color={colors.white} size={32} />
                        </View>
                    )
                }}
                component={mainScreen} />
            <Tab.Screen name="energy" component={energyScreen} />
            <Tab.Screen name="settings" component={settingsScreen} />
        </Tab.Navigator>
    );
}

export default function App() {
    const [state, dispatch] = useReducer(
        (prevState, action) => {
            switch (action.type) {
                case 'TO_LOGIN_PAGE':
                    return {
                        ...prevState,
                        isLoading: false,
                        isSignedIn: false,
                    };
                case 'LOGIN':
                    return {
                        ...prevState,
                        isSignedIn: true,
                        userName: action.name
                    };
            }
        },
        {
            isLoading: true,
            isSignedIn: true,
            userName: null
        }
    );

    const authContextValue = useMemo(
        () => ({
            login: async data => {
                if (data) {
                    console.log(data);
                    await AsyncStorage.setItem('name', data)
                    var ws = new WebSocket('ws://oven.local:8069');
                    ws.onopen = () => {
                        req = {
                            module: 'other',
                            function: 'setUserName',
                            params: [data]
                        }
                        ws.send(JSON.stringify(req));
                    };
                    dispatch({ type: 'LOGIN', token: 'Token-For-Now' });
                } else {
                    dispatch({ type: 'TO_LOGIN_PAGE' });
                }
            },
        }),
        []
    );

    const chooseScreen = state => {
        let navigateTo = stateConditionString(state);
        let arr = [];

        switch (navigateTo) {
            case 'LOAD_APP':
                arr.push(<Tab.Screen name="main" component={mainTabs} />);
                break;

            case 'LOAD_LOGIN':
                arr.push(<Stack.Screen name="login" component={LoginScreen} />);
                break;

            case 'LOAD_HOME':
                arr.push(
                    <Tab.Screen name="main" component={mainTabs} />
                );
                break;
            default:
                arr.push(<Tab.Screen name="main" component={mainTabs} />);
                break;
        }
        return arr[0];
    };

    useEffect(async () => {
        const authSubscriber = await AsyncStorage.getItem('name')
        if (authSubscriber !== null) {
            authContextValue.login(authSubscriber)
        }
        console.log(authSubscriber);
    }, [])

    return (
        <AuthContext.Provider value={authContextValue}>
            <NavigationContainer theme={NavContainerTheme}>
                <RootStack.Navigator headerMode='none'>
                    {chooseScreen(state)}
                </RootStack.Navigator>
            </NavigationContainer>
        </AuthContext.Provider>
    );
}
