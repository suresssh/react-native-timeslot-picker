/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { TouchableOpacity, Platform, StyleSheet, Text, View, Dimensions, ScrollView, PanResponder, Alert, ToastAndroid } from 'react-native';
import PropTypes from 'prop-types';

const platform = Platform.select({
  ios: 'IOS',
  android:
    'ANDROID',
});

export default class TimeSlotPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      daySection: [],
      section: this.props.section,
      selectionStart: '',
      selectionEnd: '',
      layoutPosition: '',
      dayDuration: '',
      timeDuration: '',
      minuteDuration: '',
      selectionAreaHeight: 0,
      gesturePermit: true,
      allowToast: false,
      minuteSection: null,
      previousEndSelection: null,
      showSelectionArea: false,
      selectionAreaSpace: 0,
      currentDate: new Date(),
      doubleTap: false
    }
  }


  componentWillReceiveProps() {
    this.newDayDuration();
  }

  newDayDuration = () => {
    this.refs['timeslotcontainer'].measure((fx, fy, width, height, px, py) => {
      this.setState({
        // daySection: daySection,
        layoutPosition: py,
        dayDuration: height,
        timeDuration: height / this.props.section,
        minuteDuration: (height / this.props.section) / 4,
        selectionTopSpace: 0,
        allowToast: false,
        showSelectionArea: false
      });
    });
  }

  //sets day duration and time duration
  onDayDuration = (e) => {
    // alert(1)
    this.setState({
      // daySection: daySection,
      layoutPosition: e.nativeEvent.layout.y,
      dayDuration: e.nativeEvent.layout.height,
      timeDuration: e.nativeEvent.layout.height / this.props.section,
      minuteDuration: (e.nativeEvent.layout.height / this.props.section) / 4,
      selectionTopSpace: 0,
      allowToast: false,
    });
  }



  // on drags on timing
  _onSlotDragging = (event, gestureState) => {

    // selection starts
    var gestureStartSection = this.state.selectionStart;

    // tracks previous selection
    var gesturePosition = gestureState.moveY - this.state.layoutPosition;
    var gestureEndSection = parseInt(gesturePosition / this.state.timeDuration);

    // console.log(this.props.daySection[0].avail );
    // var daySection = this.props.daySection;
    // daySection[1].avail = false
    // this.setState({ daySection: daySection })
    // console.log(this.props.daySection)

    //calculates minutes in the time slot
    let currentSectionPositionStart = (gestureEndSection) * this.state.timeDuration;

    let minuteSection = gesturePosition - currentSectionPositionStart;
    if (minuteSection < this.state.minuteDuration) {

      gesturePosition = gesturePosition - minuteSection;
      minuteSection = this.state.minuteDuration;
      gesturePosition = gesturePosition + minuteSection;
    } else if (minuteSection < this.state.minuteDuration * 2) {
      gesturePosition = gesturePosition - minuteSection;
      minuteSection = this.state.minuteDuration * 2
      gesturePosition = gesturePosition + minuteSection;
    } else if (minuteSection < this.state.minuteDuration * 3) {
      gesturePosition = gesturePosition - minuteSection;
      minuteSection = this.state.minuteDuration * 3;
      gesturePosition = gesturePosition + minuteSection;
    } else if (minuteSection > this.state.minuteDuration * 3) {
      gesturePosition = gesturePosition - minuteSection;
      minuteSection = this.state.timeDuration;
      gesturePosition = gesturePosition + minuteSection;
    }

    this.setState({
      previousEndSelection: gestureEndSection, selectionEnd: gestureEndSection,
    });
    if (this.props.section - 1 > gestureEndSection && gestureEndSection > 0) {

      if (this.props.daySection[gestureEndSection].avail) {
        this.setState({
          selectionEnd: gestureEndSection,
          selectionAreaHeight: gesturePosition - this.state.selectionTopSpace,
          minuteSection: minuteSection,
          allowToast: true,
        });
      }
      else if (!this.props.daySection[gestureEndSection].avail && this.state.previousEndSelection != gestureEndSection) {
        Alert.alert('Timing Alert', 'Already booked',
          [
            { text: 'OK', onPress: () => this.setState({ showSelectionArea: false, showSelectionArea: false }) },
          ], { cancelable: false });
      }
    }
  };



  //on selects an timing
  _onSlotBegin = (event, gestureState) => {
    if (!this.state.showSelectionArea) {
      // this.setState({ showSelectionArea: false })
      // this.setState({ selectionAreaHeight: 0, selectionTopSpace: 0 })    //sets starting of draging
      let selectionStartPosition = event.nativeEvent.pageY - this.state.layoutPosition;
      let gestureEnd = parseInt((event.nativeEvent.pageY - this.state.layoutPosition) / this.state.timeDuration);
      let selectionStart = parseInt(selectionStartPosition / this.state.timeDuration);
      let daySection = this.props.daySection;
      var timeDuration = this.state.timeDuration;
      var exactHeight = this.state.timeDuration * (selectionStart + 1);
      var selectionAreaHeight = exactHeight - selectionStartPosition;
      var minDur = this.state.timeDuration - selectionAreaHeight;
      var minSection = parseInt(minDur / this.state.minuteDuration)

      // alert(minSection);

      //checks availability

      var timeSlot = this.props.daySection[selectionStart];
      var timeSlotMin = timeSlot.minutes;

      if (minSection < 3 && minSection != 0)
        var currentMinSlot = timeSlotMin[minSection - 1].avail

      if (!timeSlotMin[0].avail && !timeSlotMin[1].avail && !timeSlotMin[2].avail && !timeSlotMin[3].avail) {
        Alert.alert('Timing Alert', 'Already booked',
          [
            { text: 'OK', onPress: () => this.setState({ showSelectionArea: false }) },
          ],
          { cancelable: false })
      }
      else {
        // }
        // if (timeSlotMin[0].avail && timeSlotMin[1].avail && timeSlotMin[2].avail && timeSlotMin[3].avail) {
        if (this.props.section - 1 > gestureEnd) {
          if (selectionStart === 0) {
            selectionStartPosition = 0;
          }
          else {
            selectionStartPosition = (selectionStart) * this.state.timeDuration;
          }
          if (!timeSlotMin[0].avail || !timeSlotMin[1].avail || !timeSlotMin[2].avail || !timeSlotMin[3].avail) {
            var minBooked = 1;
            !timeSlotMin[0].avail ? minBooked = 1 : null;
            !timeSlotMin[1].avail ? minBooked = 2 : null;
            !timeSlotMin[2].avail ? minBooked = 3 : null;
            !timeSlotMin[3].avail ? minBooked = 4 : null;

            selectionStartPosition = selectionStartPosition + (this.state.minuteDuration * minBooked);
            timeDuration = timeDuration - (this.state.minuteDuration * minBooked);
          }

          this.setState({
            allowToast: true,
            selectionStart: selectionStart,
            previousEndSelection: gestureEnd,
            selectionEnd: gestureEnd,
            showSelectionArea: true,
            selectionTopSpace: selectionStartPosition,
            selectionAreaHeight: timeDuration, daySection: daySection, minuteSection: null
          });

        }
      }
    }
  }

  //selected time slot
  _slotFinalize = (event, gestureState) => {
    var daySection = this.props.daySection;
    var start = this.state.selectionStart;
    var end = this.state.selectionEnd;
    // ToastAndroid(this.props.daySection[start].time);
    if (this.state.allowToast && this.props.section - 1 > end) {
      if (start === end || this.state.minuteSection > this.state.timeDuration - 2) {
        Platform.select({
          android:
            this._toastmessenger('Booked from ' + this.props.daySection[start].time + ' to ' + this.props.daySection[end + 1].time)
        })
        const { onDragSelect } = this.props;
        onDragSelect('Booked from ' + this.props.daySection[start].time + ' to ' + this.props.daySection[end + 1].time)
      }
      else if (this.state.minuteSection < this.state.timeDuration - 2 && this.state.minuteSection != null) {
        // console.log(parseInt(this.state.minuteSection), parseInt(this.state.minuteDuration))
        var starts = this.props.daySection[start].time;
        const { onDragSelect } = this.props;
        if (parseInt(this.state.minuteSection) === parseInt(this.state.minuteDuration * 3)) {
          let ends = (this.props.daySection[end].time).replace('00', '45');
          this._toastmessenger('Booked from ' + starts + ' to ' + ends)
          onDragSelect('Booked from ' + starts + ' to ' + ends)
        }
        if (parseInt(this.state.minuteSection) === parseInt(this.state.minuteDuration * 2)) {
          let ends = (this.props.daySection[end].time).replace('00', '30');
          this._toastmessenger('Booked from ' + starts + ' to ' + ends)
          onDragSelect('Booked from ' + starts + ' to ' + ends)
        }
        if (parseInt(this.state.minuteSection) === parseInt(this.state.minuteDuration)) {
          let ends = (this.props.daySection[end].time).replace('00', '15');
          this._toastmessenger('Booked from ' + starts + ' to ' + ends)
          onDragSelect('Booked from ' + starts + ' to ' + ends)
        }
      }
    }
  }


  //toast messenger
  _toastmessenger = (message) => {
    platform != 'IOS' ?
      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER)
      : null;
  }


  //timing view pan responder
  _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => this.state.gesturePermit,
    onStartShouldSetPanResponderCapture: this._onSlotBegin,
    onMoveShouldSetPanResponder: (evt, gestureState) => this.state.gesturePermit,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => this.state.gesturePermit,
    onPanResponderMove: this._onSlotDragging,
    onPanResponderGrant: this.removeSelection,
    onPanResponderRelease: this._slotFinalize
  });


  //doubleTapHandling
  handleDoubleTap = () => {
    if (this.state.doubleTap) {
      this.setState({ showSelectionArea: false, doubleTap: false })
    } else {
      this.setState({ doubleTap: !this.state.doubleTap })
    }
  }


  render() {
    const { currentDate, selectionAreaSpace, showSelectionArea, selectionTopSpace, selectionAreaHeight, dayDuration, minuteDuration, timeDuration, gesturePermit } = this.state;
    const { section, daySection, selectionBackGroundColor, layoutColor, bgColor } = this.props;
    const selectionTop = parseInt(selectionTopSpace);
    const sectionBorderColor = layoutColor ? { borderColor: layoutColor } : { borderColor: '#fff' };
    const fontColor = layoutColor ? { color: layoutColor } : { color: '#fff' };
    const selectionBackGround = { borderColor: layoutColor, backgroundColor: selectionBackGroundColor };
    const bgc = bgColor ? { backgroundColor: bgColor } : { backgroundColor: null };

    const selectionView = (
      <View style={[styles.selection,
        selectionBackGround,
      { marginLeft: selectionAreaSpace, marginTop: selectionTop + 7, height: selectionAreaHeight }]} >
        <View style={[styles.tracker, {
          height: selectionAreaHeight + 10,
        }]} >
          <View style={[styles.pointer, selectionBackGround]} />
          <View style={[styles.pointer, selectionBackGround]} />
        </View>
      </View>)


    return (
      <View style={[styles.day, bgc]} ref={'timeslotcontainer'} onLayout={this.onDayDuration} {...this._panResponder.panHandlers}>
        {showSelectionArea ?
          selectionView
          : null}
        {daySection.map((item, index) =>
          <View key={index} style={styles.dayNtime}
            onTouchStart={this.handleDoubleTap}
            ref={(thisItem) => this[`item-${index}`] = thisItem}>
            <View style={styles.timing}>
              <Text style={fontColor}>{item.time}</Text>
            </View>
            <View style={{ marginTop: 7 }} onTouchStart={() => this.setState({ slotBegin: true })} onLayout={(e) => this.setState({ selectionAreaSpace: e.nativeEvent.layout.x })}>
              <View key={index} style={[styles.daySection, sectionBorderColor, { height: dayDuration / item.duration }, index == daySection.length - 1 ? { borderTopWidth: 1 } : null]} >
                {item.minutes.map((i, index) =>
                  <View key={index} style={[{ height: (dayDuration / item.duration) / 4 }, i.avail ? null : { backgroundColor: '#6D6D6D' }]} >
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}

TimeSlotPicker.propTypes = {
  section: PropTypes.number,
  daySection: PropTypes.array,
  selectionBackGroundColor: PropTypes.string,
  layoutColor: PropTypes.string,
  bgColor: PropTypes.string,
  onDragSelect: PropTypes.func
}

const styles = StyleSheet.create({
  day: {
    borderRadius: 5,
    marginLeft: 25,
    // width: Dimensions.get('window').width * 3 / 4,
    height: Dimensions.get('window').height * 3 / 4,
  },
  dayNtime: { flex: 1, flexDirection: 'row', alignSelf: 'stretch' },
  timing: { flexDirection: "row", flexBasis: 65 },
  tracker: {
    width: 10,
    opacity: 1,
    borderRadius: 5,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  selection: {
    justifyContent: 'center',
    alignItems: 'center',
    // alignSelf: 'center',
    // borderRadius: 5,
    borderTopWidth: 1,
    borderBottomWidth: 0.5,
    zIndex: 1,
    marginTop: 0,
    width: Dimensions.get('window').width * 3 / 4,
    height: 0,
    position: 'absolute'
  },
  daySection: {
    borderTopWidth: 1,
    width: Dimensions.get('window').width * 3 / 4,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  pointer: {
    opacity: 0.9,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 0.5, width: 9, height: 9,
  }
});
