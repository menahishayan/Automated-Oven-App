import { StyleSheet } from 'react-native';

export const colors = {
    red: '#c30000',
    lightRed: '#ff303a',
    orange: '#ff7312',
    yellow: '#ffd800',
    green: '#30c69f',
    lightGreen: '#00de65',
    blue: '#3b91fc',
    lightBlue: '#f0fbff',
    turquoise: '#4febff',
    grey: '#e1dddd',
    textGrey: '#acadad',
    darkGrey: '#727676',
    white: '#fff',
    black: '#000',
    navBarInactive: '#b9b9b9'
}

export const styles = StyleSheet.create({

    title: {
        fontWeight: '600',
        fontSize: 36,
        marginTop: 25,
        marginBottom: 2,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: 'grey',
        marginBottom: 15,
        textAlign: 'center',
    },
    sliderTrackStyle: {
        backgroundColor: colors.grey,
        height: 12,
        borderRadius: 20,
    },
    roundButtonM: {
        height: 60,
        width: 60,
        borderRadius: 30,
        padding: 0,
        alignSelf: 'center',
        backgroundColor: colors.white,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4.84,
        elevation: 11,
    },
    roundButtonPaddingM: {
        height: 80,
        width: 80,
        padding: 7,
        // marginTop:10,
        alignSelf: 'center',
    },
    roundButtonS: {
        height: 40,
        width: 40,
        borderRadius: 20,
        padding: 0,
        alignSelf: 'center',
        backgroundColor: colors.white,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    roundButtonPaddingS: {
        height: 50,
        width: 50,
        padding: 2,
        // marginTop:10,
        alignSelf: 'center',
    },
    //   ********* historyScreen ********* 
    heading: {
        fontWeight: 'bold',
        fontSize: 36,
        color: colors.blue,
        marginTop: 70,
        marginBottom: 36,
        marginLeft: 26,
    },
    foodContainer: {
        width: '85%',
        height: 75,
        alignSelf: 'center',
        backgroundColor: colors.white,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        zIndex: 1,
        shadowOpacity: 0.15,
        shadowRadius: 3.34,
        elevation: 4,
    },
    detailsContainer: {
        width: '85%',
        height: 43,
        zIndex: 0,
        flexDirection: 'row',
        marginBottom: 20,
        alignSelf: 'center',
        backgroundColor: colors.lightBlue,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tagBadge: {
        height: 45,
        width: 45,
        marginLeft: 14,
        marginTop: 15,
        borderRadius: 22,
        padding: 0,
        backgroundColor: colors.yellow,
    },
    foodCircleM: {
        height: 28,
        width: 28,
        borderRadius: 22,
        marginTop: 26,
    },
    detailsCircle: {
        marginTop: 12,
        height: 22,
        width: 22,
        marginLeft: 14,
        borderRadius: 22,
        // padding: 0,
        justifyContent: 'center'
    },
    detailText: {
        marginTop: 15,
        marginRight: 18,
        color: colors.darkGrey,
    },
    //  ********** profile screen *********
    profileCircle: {
        height: 65,
        width: 65,
        marginLeft: 60,
        borderRadius: 32,
        marginBottom: 42,
        padding: 20,
        backgroundColor: colors.yellow,
    },
    fullName: {
        fontWeight: 'bold',
        marginLeft: 14,
        marginRight: 38,
        fontSize: 22
    },
    weekly: {
        fontWeight: '500',
        marginLeft: 36,
        marginRight: 38,
        fontSize: 22,
        marginBottom: 10,
        width: '40%',
    },
    energy: {
        fontSize: 16,
        color: 'grey',
        marginTop: 6,
        textAlign: 'right',
        width: '30%',
    },
    recomend: {
        width: '50%',
        height: '50%',
        marginTop: 20,
        marginLeft: 26,
        // alignSelf: 'center',
        backgroundColor: colors.darkGrey,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        zIndex: 1,

    },
    recomendContainer: {
        zIndex: 0,
        // alignSelf: 'center',
        backgroundColor: colors.blue,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    // ********* energy screen ********
    consumption: {
        textAlign: 'right',
        width: '30%',
        fontWeight: '600',
        fontSize: 28,
        color: colors.black,
        marginTop: -2
    },
    tagContainer: {
        width: '85%',
        height: 75,
        alignSelf: 'center',
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 8,
        paddingTop: 8,
        backgroundColor: colors.white,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    graphLabel: {
        fontWeight: '400',
        marginLeft: 36,
        marginRight: 38,
        fontSize: 20,
        marginBottom: 10,
        width: '40%',
        color: colors.darkGrey
    },
    tagLabel: {
        fontWeight: '400',
        fontSize: 20,
        width: '44%',
        marginLeft: 10,
        marginTop: 18,
        color: colors.darkGrey
    },
    // ********* automation screen ********
    autoTitle: {
        marginTop: 15,
        marginRight: 18,
        color: colors.darkGrey,
    },
    autoContainer: {
        width: '85%',
        alignSelf: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        marginBottom: 40,
        shadowRadius: 3.84,
        elevation: 5,
        paddingBottom: 12
    },
    contentContainerStyle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    value: {
        fontWeight: '600',
        fontSize: 22,
        color: colors.blue,
    },
    min: {
        fontWeight: '600',
        fontSize: 14,
        color: colors.blue,
    },
    notifyMsg: {
        marginVertical: 6,
        marginHorizontal: 16,
        fontSize: 14,
        color: colors.black,
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: colors.grey,
    },
    timeThread: {
        height: 40,
        width: 5,
        backgroundColor: colors.grey,
        alignSelf: 'center',
        marginTop:-40,
    }
});
