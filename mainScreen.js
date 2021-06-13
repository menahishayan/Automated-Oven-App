import React, { useState, Fragment, useCallback } from 'react';
import Slider from '@react-native-community/slider'
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';
import { styles, colors } from './styles'
import Wand from './assets/wand.svg'
import LinearGradient from 'react-native-linear-gradient';
import Ficon from 'react-native-vector-icons/Fontisto';
import { Preheat, Cook, Checkpoint, Notify, PowerOff, Cooling } from './carouselItems';
import moment from 'moment';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import jsdom from 'jsdom-jscore-rn';
import { getCookingDetails, getInstructionClass, isAcceptedURL } from './webScraper';
import Clipboard from '@react-native-clipboard/clipboard';
import Carousel from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CircularSlider from 'rn-circular-slider'

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

const TimelineComponent = (props) => {
    var item = props.item
    console.log("item", item);
    switch (item.type) {
        case "preheat": return <Preheat {...item} />
        case "cook": return <Cook {...item} />
        case "checkpoint": return <Checkpoint {...item} />
        case "notify": return <Notify {...item} />
        case "powerOff": return <PowerOff {...item} />
        case "cool": return <Cooling {...item} />
        default: null
    }
    return null;
}

const GradientProgress = (props) => {
    return (
        <View style={[{ width: '100%', height: 12, backgroundColor: props.trackColor ? props.trackColor : '#e1dddd' }, props.trackStyle]}>
            <LinearGradient colors={[colors.yellow, colors.orange]} start={{ x: 0, y: 0 }} locations={[0.5, 1]} style={{ width: `${props.value}%`, height: '100%' }}></LinearGradient>
        </View>
    )
}

const TemperatureSlider = (props) => {
    return (
        <Fragment>
            <View style={{ flexDirection: 'row', width: '100%', marginTop: 7, marginBottom: -12 }}>
                {props.icon}
                <Text style={{ textAlign: 'right', width: '90%', color: 'grey' }}>{props.handler.value == 0 ? "OFF" : Math.round(props.handler.value) + "°C"} </Text>
            </View>
            <Slider
                maximumValue={250}
                minimumValue={0}
                maximumTrackTintColor={colors.grey}
                minimumTrackTintColor={colors.yellow}
                step={5}
                onSlidingComplete={value => { props.handler.setValue(value); ReactNativeHapticFeedback.trigger("impactLight"); props.sendHandler(props.name, value) }}
                value={props.handler.value}
                thumbTintColor="transparent"
            />
        </Fragment>
    )
}

function mainScreen({ navigation }) {
    const [time, setTime] = useState(" ");
    const [topTemp, setTopTemp] = useState(0);
    const [bottomTemp, setBottomTemp] = useState(0);
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);

    const sendCookingFromURL = (values) => {
        var ws = new WebSocket('ws://oven.local:8069');
        ws.onopen = () => {
            req = {
                module: 'cook',
                function: 'startCustom',
                params: [values]
            }
            ws.send(JSON.stringify(req));
            ws.close()
        };
    }

    const fetchFromUrl = async () => {
        const url = await Clipboard.getString();

        var regexURL = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

        if (isAcceptedURL(url) && url.match(regexURL))
            fetch(url).then(res => res.text()).then(data => {
                jsdom.env(data, (err, window) => {
                    var cookingValues = getCookingDetails(window.document.querySelectorAll(getInstructionClass(url)), url)
                    if (cookingValues['temp'] > 0 && cookingValues['time'] > 0) sendCookingFromURL(cookingValues)
                })
            })
    }

    const progressPercent = (e) => {
        if (!data.isPaused) {
            startTime = moment.unix(data.startTime);
            endTime = moment.unix(data.endTime);
            totalTime = endTime.diff(startTime, 'seconds')

            calculation = ((moment().diff(startTime, 'seconds') / totalTime) * 100)
            return calculation
        }
        return 0;
    }

    const setTemp = (name, value) => {
        var ws = new WebSocket('ws://oven.local:8069');
        ws.onopen = () => {
            req = {
                module: 'cook',
                function: `set${name}Temp`,
                params: [value]
            }
            ws.send(JSON.stringify(req));
            ws.close()
        };
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
                setTopTemp(d.top)
                setBottomTemp(d.bottom)
                d.isPaused ? setTime('Paused') : setTime(`${moment.unix(d.endTime).diff(moment(), 'minutes')} min ${moment.unix(d.endTime).diff(moment(), 'seconds') % 60} sec left`)
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
                        if (!d.result.isCooking)
                            fetchFromUrl()
                        console.log("data steps", d.result.steps);
                        console.log("d.result.currentStep", d.result.currentStep);
                        this._carousel.snapToItem(d.result.currentStep);
                        parseData(d.result)
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

    const mainCard = ({ item }) => {
        var stepColor = {
            cook: {
                color: 'yellow',
                icon: 'utensils'
            },
            notify: {
                color: 'purple',
                icon: 'bell'
            },
            checkpoint: {
                color: 'blue',
                icon: 'flag'
            },
            preheat: {
                color: 'orange',
                icon: 'fire-alt'
            },
            cool: {
                color: 'turquoise',
                icon: 'snowflake'
            },
            powerOff: {
                color: 'red',
                icon: 'power-off'
            }
        }
        return (
            <View style={styles.mainCardContainer}>
                {/* <CircularSlider
                    step={1} min={0} max={100} value={60}
                    contentContainerStyle={styles.contentContainerStyle} 
                    strokeWidth={4} 
                    // buttonBorderColor={transparent}
                    openingRadian={Math.PI / 4} buttonRadius={8} radius={40} linearGradient={[{ stop: '0%', color: colors.orange }, { stop: '100%', color: colors.red }]}
                >
                    <Text style={{ 'color': colors.red, 'fontSize': 18 }}>{60}°C</Text>
                </CircularSlider> */}
                {
                /* <View style={[styles.carouselCircle, { backgroundColor: colors[stepColor[item.type].color] }]}>
                    <Icon name={stepColor[item.type].icon} color={colors.white} size={38} solid style={{ alignSelf: 'center' }} />
                </View> */
                }
                <Text style={styles.carouselTitle}>{item.type.capitalize()}</Text>
                <TimelineComponent item={item} />
            </View>
        )
    }

    return (
        data ? <View>

            <Text style={styles.title}>{data.isCooking ? data.item : (data.cooktype == 'Done' ? 'Done' : 'Empty')}</Text>

            {
                data.steps && <Fragment>
                    <Carousel
                        layout={"default"}
                        // ref={ref => this.carousel = ref}
                        ref={(c) => { this._carousel = c; }}
                        data={data.steps}
                        sliderWidth={400}
                        itemWidth={400}
                        renderItem={mainCard}
                        contentContainerCustomStyle={{ marginLeft: 45 }}
                    />
                </Fragment>
            }

            {/* <GradientProgress value={data.isCooking ? progressPercent() : 0} trackColor={colors.white} /> */}

            <Text style={styles.subtitle}>{data.isCooking ? time : ' '}</Text>
            {/* <View style={{ width: '80%', alignSelf: 'center' }}>
                <TemperatureSlider icon={<OvenTop height={29} width={29} fill={colors.black} />} handler={{ value: topTemp, setValue: setTopTemp }} sendHandler={setTemp} name='Top' />
                <TemperatureSlider icon={<OvenBottom height={29} width={29} fill={colors.black} />} handler={{ value: bottomTemp, setValue: setBottomTemp }} sendHandler={setTemp} name='Bottom' />
            </View> */}

            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', marginTop: 18 }}>
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