import React, { useEffect, useState, useReducer, useMemo, useContext } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import historyScreen from './historyScreen'
import mainScreen from './mainScreen'
import energyScreen from './energyScreen'
import automationEditScreen from './automationEditScreen'
import automationScreen from './automationScreen'
import settingsScreen from './settingsScreen'
import { styles, colors } from './styles'
import { TextInput, View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext, stateConditionString } from './AuthContext';
import { Notifications } from 'react-native-notifications';

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

function HistoryStack() {
    return (
        <Stack.Navigator initialRouteName="historyScreen" headerMode='none'>
            <Stack.Screen name="historyScreen" component={historyScreen} />
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
                        return <IonIcon name="color-wand" size={size + 4} color={color} />;
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
            <Tab.Screen name="history" component={HistoryStack} />
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
                if (data !== null) {
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
                    dispatch({ type: 'LOGIN', name: data });
                } else {
                    dispatch({ type: 'TO_LOGIN_PAGE' });
                }
            }
        }),
        []
    );

    const chooseScreen = state => {
        let navigateTo = stateConditionString(state);

        switch (navigateTo) {
            case 'LOAD_APP':
                return <Tab.Screen name="main" component={mainTabs} />;
            case 'LOAD_LOGIN':
                return <Stack.Screen name="login" component={LoginScreen} />;
            case 'LOAD_HOME':
                return <Tab.Screen name="main" component={mainTabs} />
            default:
                return <Stack.Screen name="login" component={LoginScreen} />;
        }
    };

    useEffect(async () => {
        const authSubscriber = await AsyncStorage.getItem('name')

        authContextValue.login(authSubscriber)

        Notifications.registerRemoteNotifications();

        Notifications.events().registerRemoteNotificationsRegistered((event) => {
            // TODO: Send the token to my server so it could send back push notifications...
            console.log("Device Token Received", event.deviceToken);
        });
        Notifications.events().registerRemoteNotificationsRegistrationFailed((event) => {
            console.error(event);
        });

        Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
            console.log("Notification Received - Foreground", notification.payload);

            // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
            completion({ alert: true, sound: true, badge: false });
        });

        Notifications.events().registerNotificationOpened((notification, completion, action) => {
            console.log("Notification opened by device user", notification.payload);
            console.log(`Notification opened with an action identifier: ${action.identifier} and response text: ${action.text}`);
            completion();
        });

        Notifications.events().registerNotificationReceivedBackground((notification, completion) => {
            console.log("Notification Received - Background", notification.payload);

            // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
            completion({ alert: true, sound: true, badge: false });
        });

    }, [])

    return (
        <AuthContext.Provider value={{ name: state.userName, authContextValue }}>
            <NavigationContainer theme={NavContainerTheme}>
                <RootStack.Navigator headerMode='none'>
                    {chooseScreen(state)}
                </RootStack.Navigator>
            </NavigationContainer>
        </AuthContext.Provider>
    );
}
