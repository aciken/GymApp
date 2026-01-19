import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

export default function HeightWeight() {
  const router = useRouter();
  const [unit, setUnit] = useState('imperial'); // 'imperial' or 'metric'
  
  // Imperial states
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(7);
  const [lbs, setLbs] = useState(150);

  // Metric states
  const [cm, setCm] = useState(170);
  const [kg, setKg] = useState(68);

  const toggleUnit = () => {
    setUnit(unit === 'imperial' ? 'metric' : 'imperial');
  };

  const feetOptions = Array.from({ length: 5 }, (_, i) => i + 3); // 3-7 ft
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i); // 0-11 in
  const lbsOptions = Array.from({ length: 251 }, (_, i) => i + 100); // 100-350 lbs
  const cmOptions = Array.from({ length: 121 }, (_, i) => i + 120); // 120-240 cm
  const kgOptions = Array.from({ length: 131 }, (_, i) => i + 40); // 40-170 kg

  return (
    <LinearGradient 
      colors={['#4C3100', '#000000']} 
      style={styles.container}
      locations={[0, 0.5]}
    >
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.content}>
          <View style={styles.topContainer}>
            <Text style={styles.title}>Height & Weight</Text>
            <Text style={styles.description}>This will be used to create your custom plan.</Text>
          </View>

          <View style={styles.pickersContainer}>
            {unit === 'imperial' ? (
              <>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Height</Text>
                  <View style={styles.pickerRow}>
                    <Picker
                      selectedValue={feet}
                      style={styles.imperialHeightPicker}
                      itemStyle={styles.pickerItem}
                      onValueChange={(itemValue) => setFeet(itemValue)}
                    >
                      {feetOptions.map((f) => <Picker.Item key={f} label={`${f} ft`} value={f} />)}
                    </Picker>
                    <Picker
                      selectedValue={inches}
                      style={styles.imperialHeightPicker}
                      itemStyle={styles.pickerItem}
                      onValueChange={(itemValue) => setInches(itemValue)}
                    >
                      {inchesOptions.map((i) => <Picker.Item key={i} label={`${i} in`} value={i} />)}
                    </Picker>
                  </View>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Weight</Text>
                  <Picker
                    selectedValue={lbs}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    onValueChange={(itemValue) => setLbs(itemValue)}
                  >
                    {lbsOptions.map((l) => <Picker.Item key={l} label={`${l} lb`} value={l} />)}
                  </Picker>
                </View>
              </>
            ) : (
              <>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Height</Text>
                  <Picker
                    selectedValue={cm}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    onValueChange={(itemValue) => setCm(itemValue)}
                  >
                    {cmOptions.map((c) => <Picker.Item key={c} label={`${c} cm`} value={c} />)}
                  </Picker>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Weight</Text>
                  <Picker
                    selectedValue={kg}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    onValueChange={(itemValue) => setKg(itemValue)}
                  >
                    {kgOptions.map((k) => <Picker.Item key={k} label={`${k} kg`} value={k} />)}
                  </Picker>
                </View>
              </>
            )}
          </View>

          <View style={styles.bottomContainer}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Imperial</Text>
              <Switch
                value={unit === 'metric'}
                onValueChange={toggleUnit}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#FFFFFF' }}
                thumbColor={unit === 'metric' ? '#101010' : '#FFFFFF'}
              />
              <Text style={styles.switchLabel}>Metric</Text>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={() => router.push('/onboarding/calculating')}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    content: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 20,
    },
    topContainer: {
      alignItems: 'center',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    description: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
    },
    pickersContainer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
    },
    pickerColumn: {
      alignItems: 'center',
    },
    pickerRow: {
      flexDirection: 'row',
    },
    pickerLabel: {
      color: '#FFFFFF',
      fontSize: 18,
      marginBottom: 10,
    },
    picker: {
      width: 150,
      height: 200,
    },
    imperialHeightPicker: {
        width: 100,
        height: 200,
    },
    pickerItem: {
      color: '#FFFFFF',
      fontSize: 20,
    },
    bottomContainer: {
        width: '100%',
        alignItems: 'center',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 30,
    },
    switchLabel: {
      color: '#FFFFFF',
      fontSize: 18,
      marginHorizontal: 10,
    },
    nextButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 25,
      paddingVertical: 15,
      width: '100%',
      alignItems: 'center',
    },
    nextButtonText: {
      color: '#000000',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
