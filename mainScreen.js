import React, { useState, Fragment, useCallback } from 'react';
import Slider from '@react-native-community/slider'
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';
import { Button, Overlay } from 'react-native-elements';
import { styles, colors } from './styles'
import Wand from './assets/wand.svg'
import LinearGradient from 'react-native-linear-gradient';
import Ficon from 'react-native-vector-icons/Fontisto';
import { Preheat, Cook, Checkpoint, Notify, PowerOff, Cooling } from './carouselItems';
import moment from 'moment';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import jsdom from 'jsdom-jscore-rn';
import { getCookingDetails, getInstructionClass, isAcceptedURL, getTitleClass, cleanTitle } from './webScraper';
import Clipboard from '@react-native-clipboard/clipboard';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CircularSlider from 'rn-circular-slider'

// https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

const progressPercent = (start, end, useTemp = false) => {
    if (useTemp) {
        return Math.round(start / end)
    }
    if (start && end) {
        startTime = moment.unix(start);
        endTime = moment.unix(end);
        totalTime = endTime.diff(startTime, 'seconds')

        return Math.round((moment().diff(startTime, 'seconds') / totalTime) * 100)
    }
    return 0;
}

const TimelineComponent = (props) => {
    var item = props.item
    // console.log("item", item);
    switch (item.type) {
        case "preheat": return <Preheat {...item} percent={props.percent} />
        case "cook": return <Cook {...item} percent={props.percent} />
        case "checkpoint": return <Checkpoint {...item} percent={props.percent} />
        case "notify": return <Notify {...item} percent={props.percent} />
        case "powerOff": return <PowerOff {...item} percent={props.percent} />
        case "cool": return <Cooling {...item} percent={props.percent} />
        default: null
    }
    return null;
}

// const GradientProgress = (props) => {
//     return (
//         <View style={[{ width: '100%', height: 12, backgroundColor: props.trackColor ? props.trackColor : '#e1dddd' }, props.trackStyle]}>
//             <LinearGradient colors={[colors.yellow, colors.orange]} start={{ x: 0, y: 0 }} locations={[0.5, 1]} style={{ width: `${props.value}%`, height: '100%' }}></LinearGradient>
//         </View>
//     )
// }

function mainScreen({ navigation }) {
    const [time, setTime] = useState(0);
    const [data, setData] = useState();
    const [urlData, setUrlData] = useState();
    const [getUrl, setGetUrl] = useState(false);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);

    const sendCookingFromURL = (values) => {
        console.log("sendCookingFromURL values", values);
        var ws = new WebSocket('ws://oven.local:8069');
        ws.onopen = () => {
            req = {
                module: 'cook',
                function: 'startFromSimple',
                params: [values]
            }
            ws.send(JSON.stringify(req));
            ws.close()
        };
    }

    const fetchFromUrl = async () => {
        // const url = await Clipboard.getString();
        const url = await Clipboard.getString("https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/");

        var regexURL = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

        if (isAcceptedURL(url) && url.match(regexURL)) {
            fetch(url).then(res => res.text()).then(data => {
                jsdom.env(data, (err, window) => {
                    var cookingValues = getCookingDetails(window.document.querySelectorAll(getInstructionClass(url)), url)
                    cookingValues.item = cleanTitle(window.document.querySelector(getTitleClass(url)).textContent)
                    setVisible(true)

                    if (cookingValues['temp'] > 0 && cookingValues['time'] > 0) setUrlData(cookingValues)
                    console.log("cookingValues", cookingValues);

                })
            })
        }
    }

    const sendRequest = (task) => {
        var ws = new WebSocket('ws://oven.local:8069');
        ReactNativeHapticFeedback.trigger("impactHeavy");
        ws.onopen = () => {
            if (task == 'stop')
                req = {
                    module: 'cook',
                    function: 'stop'
                }
            else
                req = {
                    module: 'cook',
                    function: data.isPaused ? 'resume' : 'pause'
                }
            ws.send(JSON.stringify(req));
            ws.close()
        };
    }

    useFocusEffect(
        useCallback(() => {
            ReactNativeHapticFeedback.trigger("impactHeavy");
            const parseData = (d) => {
                _time = 0
                firstStepStart = moment.unix(Math.round(d.steps[0].startTime))
                d.steps.filter(s => s.type == 'cook').forEach(step => _time += step.duration * 60)
                firstStepStart.add(_time, 'm')
                setTime(firstStepStart.diff(moment(), 'seconds'))
            }

            var intervalId = setInterval(() => {
                var ws = new WebSocket('ws://oven.local:8069');
                ws.onopen = () => {
                    req = {
                        module: 'cook',
                        function: 'get'
                    }
                    ws.send(JSON.stringify(req));
                };
                ws.onmessage = (e) => {
                    d = JSON.parse(e.data)
                    if (d.type == 'result' && d.req == 'get') {
                        setData(d.result)
                        if (!d.result.isCooking) setGetUrl(true)
                        else setGetUrl(false)
                        console.log("data", d.result)
                        if (data) {
                            if (data.currentStep == d.result.currentStep - 1)
                                this._carousel.snapToItem(d.result.currentStep);
                        }
                        if (d.isCooking) parseData(d.result)
                    }
                    ws.close()
                };
            }, 1000)

            setTimeout(() => setLoading(false), 5000)

            return () => {
                clearInterval(intervalId);
            }
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            fetchFromUrl()
        }, [getUrl])
    );

    return (
        data ? <View>
            <Text style={[styles.title]}>{data.isCooking ? data.item : (data.cooktype == 'Done' ? 'Done' : 'Empty')}</Text>
            {
                // urlData && visible && 
                <Overlay isVisible={visible} overlayStyle={styles.urlOverlay} onBackdropPress={() => setVisible(false)}>
                    <View style={{ flexDirection: 'row' , justifyContent: 'center' }}>
                        <Ficon name="link2" size={20} color={colors.blue} />
                        <Text style={styles.urlName}> Chocolate cake</Text>
                    </View>

                    <View style={{ flexDirection: 'row', width: '80%', alignSelf: 'center' }}>
                        <Text style={styles.urlTemp}>170 °C</Text>
                        <Text style={styles.urlTemp}>15 min</Text>
                    </View>

                    <Button
                        title="Cook"
                        titleStyle={{fontSize:15}}
                        buttonStyle={styles.urlCook}
                    // containerStyle={styles.saveButton}
                    />

                    {/* <Text style={styles.addStep}>{urlData.items}</Text>
                    <Text style={styles.addStep}>{urlData.temp}</Text>
                    <Text style={styles.addStep}>{urlData.time}</Text> */}
                </Overlay>
            }
            {
                data.steps && <Fragment>
                    <Carousel
                        ref={(c) => this._carousel = c}
                        data={data.steps}
                        sliderWidth={400}
                        itemWidth={400}
                        renderItem={({ item }) => <TimelineComponent item={item} percent={item.isDone ? 100 : (item.type == 'preheat' ? progressPercent(data.currentTempTop, item.temp, true) : progressPercent(item.startTime, item.endTime))} />}
                        containerCustomStyle={{ flexGrow: 0 }}
                    />
                    <Pagination
                        dotsLength={data.steps.length}
                        activeDotIndex={data.currentStep}
                        dotStyle={{
                            width: 15,
                            height: 15,
                            borderRadius: 8,
                            marginHorizontal: 6,
                            backgroundColor: colors.blue
                        }}
                        tappableDots={true}
                        carouselRef={this._carousel}
                        inactiveDotStyle={{ backgroundColor: colors.darkGrey }}
                        inactiveDotScale={1}
                        containerStyle={{ paddingVertical: 0 }}
                    />
                </Fragment>
            }



            {/* <GradientProgress value={data.isCooking ? progressPercent() : 0} trackColor={colors.white} /> */}
            <Text style={styles.subtitle}>{data.isCooking ? `${Math.floor(time / 60)} min and ${time % 60} sec` : ' '}</Text>

            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', marginTop: 12 }}>
                {data.isCooking && <Button
                    onPress={() => navigation.navigate('automationScreen')}
                    icon={<Wand height={25} width={25} fill={colors.black} />}
                    buttonStyle={styles.roundButtonS}
                    containerStyle={styles.roundButtonPaddingS}
                />}
                <Button
                    onPress={() => sendRequest('pause')}
                    icon={<Ficon name={data.isCooking && !data.isPaused ? 'pause' : 'play'} size={28} color={colors.darkGrey} style={{ alignSelf: 'center' }} />}
                    buttonStyle={styles.roundButtonM}
                    containerStyle={[styles.roundButtonPaddingM]}
                />
                {data.isCooking && <Button
                    onPress={() => sendRequest('stop')}
                    icon={<Ficon name="close-a" size={16} color={colors.red} />}
                    buttonStyle={styles.roundButtonS}
                    containerStyle={styles.roundButtonPaddingS}
                />}
            </View>
        </View> :
            <View style={{ width: '100%', height: '100%', justifyContent: 'center', padding: '15%' }}>
                <ActivityIndicator size="large" />
                <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 24, color: colors.textGrey, marginTop: 20 }}>{loading ? "Connecting to the device" : "Couldn't connect to the device. Make sure it's powered on."}</Text>
            </View>

    );
}

export default mainScreen