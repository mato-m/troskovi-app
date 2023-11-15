import { StatusBar } from "expo-status-bar";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Crypto from "expo-crypto";
import { Picker } from "@react-native-picker/picker";
import { useFonts, Lato_400Regular } from "@expo-google-fonts/lato";
import React, { useEffect, useRef, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import Constants from "expo-constants";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function App() {
  const [sortBy, setSortBy] = useState("Value");
  const [sortAsc, setSortAsc] = useState(false);
  const [exInList, setExInList] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const scrollViewRef = useRef(null);
  const [selectedType, setSelectedType] = useState("Oboje");
  const [selectedTimeType, setSelectedTimeType] = useState("Dnevno");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateAdd, setDateAdd] = useState(new Date());
  const [timeAdd, setTimeAdd] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddDatePicker, setShowAddDatePicker] = useState(false);
  const [showAddTimePicker, setShowAddTimePicker] = useState(false);
  const [newEntryName, setNewEntryName] = useState("");
  const [newEntryPrice, setNewEntryPrice] = useState("");
  const [selectedEntryType, setSelectedEntryType] = useState("Trošak");
  const [fontsLoaded] = useFonts({
    Lato_400Regular,
  });
  const expensePickerItems = [
    { name: "Zabava", icon: "film", color: "#cc3300" },
    { name: "Komunalije", icon: "bolt", color: "#cc9900" },
    { name: "Stanarina", icon: "home", color: "#330099" },
    { name: "Transport", icon: "car", color: "#0033cc" },
    { name: "Putovanja", icon: "plane", color: "#006633" },
    { name: "Obrazovanje", icon: "book", color: "#cc3300" },
    { name: "Odjeća", icon: "tshirt", color: "#660099" },
    { name: "Zdravlje", icon: "heartbeat", color: "#990033" },
    { name: "Ostali troškovi", icon: "ellipsis-h", color: "#cc3333" },
    { name: "Namirnice", icon: "shopping-cart", color: "#800000" },
    { name: "Ishrana", icon: "utensils", color: "#808000" },
    { name: "Lična higijena", icon: "user", color: "#008080" },
    { name: "Elektronika", icon: "laptop", color: "#008000" },
    { name: "Namještaj", icon: "couch", color: "#8000ff" },
    { name: "Osiguranje", icon: "shield-alt", color: "#ff0000" },
    { name: "Krediti", icon: "hand-holding-usd", color: "#00ff00" },
    { name: "Porezi", icon: "file-invoice-dollar", color: "#0000ff" },
    { name: "Štednja", icon: "piggy-bank", color: "#ff00ff" },
  ].sort((a, b) => {
    if (a.name.startsWith("Ostali")) return 1;
    if (b.name.startsWith("Ostali")) return -1;
    return a.name.localeCompare(b.name);
  });
  const [selectedCategory, setSelectedCategory] = useState(
    expensePickerItems[0].name
  );
  const incomePickerItems = [
    { name: "Plata", icon: "money-bill-wave", color: "#006600" },
    { name: "Investicije", icon: "chart-line", color: "#cc9900" },
    { name: "Freelancing", icon: "laptop-code", color: "#330066" },
    { name: "Iznajmljivanje", icon: "home", color: "#cc3300" },
    { name: "Ostali prihodi", icon: "ellipsis-h", color: "#003300" },
    { name: "Dividende", icon: "file-invoice-dollar", color: "#800000" },
    { name: "Kamate", icon: "percent", color: "#808000" },
    { name: "Pokloni", icon: "gift", color: "#008080" },
    { name: "Prodaja imovine", icon: "hand-holding-usd", color: "#800080" },
    { name: "Honorari", icon: "file-contract", color: "#008000" },
    { name: "Penzijski fond", icon: "piggy-bank", color: "#8000ff" },
    { name: "Alimentacija", icon: "handshake", color: "#ff0000" },
    { name: "Dodatak za djecu", icon: "child", color: "#006600" },
    {
      name: "Socijalno osiguranje",
      icon: "universal-access",
      color: "#0000ff",
    },
    { name: "Naknada za nezaposlenost", icon: "user-clock", color: "#ff00ff" },
  ].sort((a, b) => {
    if (a.name.startsWith("Ostali")) return 1;
    if (b.name.startsWith("Ostali")) return -1;
    return a.name.localeCompare(b.name);
  });
  const [itemsToShow, setItemsToShow] = useState(
    [...expensePickerItems, ...incomePickerItems].sort((a, b) => {
      if (a.name.startsWith("Ostali")) return 1;
      if (b.name.startsWith("Ostali")) return -1;
      return a.name.localeCompare(b.name);
    })
  );
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("exInList");
        if (storedData) {
          setExInList(JSON.parse(storedData));
        }
      } catch (e) {
        console.log("Greška pri učitavanju podataka");
      }
    };

    loadData();
  }, []);
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("exInList", JSON.stringify(exInList));
      } catch (error) {
        console.error("Error saving data to AsyncStorage:", error);
      }
    };
    saveData();
  }, [exInList]);
  if (!fontsLoaded) {
    return null;
  }
  const handleAddEntry = () => {
    const combinedDateTime = moment(
      `${moment(dateAdd).format("YYYY-MM-DD")} ${moment(timeAdd).format(
        "HH:mm:ss"
      )}`,
      "YYYY-MM-DD HH:mm:ss"
    );

    if (newEntryName.trim().length === 0) {
      alert("Naziv nije unešen.");
      return;
    }
    const priceValue = parseFloat(newEntryPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert("Količina mora biti izražena brojem većim od 0.");
      return;
    }
    const newEntry = {
      id: Crypto.randomUUID(),
      name: newEntryName,
      price: parseFloat(newEntryPrice),
      category: selectedCategory,
      type: selectedEntryType,
      time: combinedDateTime,
    };
    setExInList([...exInList, newEntry]);
    Alert.alert(
      "Uspješno",
      selectedEntryType +
        ' "' +
        newEntryName +
        '" uspješno dodat u kategoriju "' +
        selectedCategory +
        '".'
    );
    setAddModalVisible(false);
    setNewEntryName("");
    setNewEntryPrice("");
    setSelectedEntryType("Trošak");
    setDateAdd(new Date());
    setTimeAdd(new Date());
    setSelectedCategory(expensePickerItems[0].name);
  };

  const filteredData = exInList
    .filter((v) => {
      return selectedType == "Oboje"
        ? v
        : selectedType == "Troškovi"
        ? v.type == "Trošak"
        : v.type == "Prihod";
    })
    .filter((v) => {
      return selectedCat ? v.category == selectedCat : v;
    })
    .filter((v) => {
      const expenseDate = moment(v.time);
      const selectedDate = moment(date);

      return (
        (selectedTimeType === "Dnevno" &&
          expenseDate.isSame(selectedDate, "day")) ||
        (selectedTimeType === "Mjesečno" &&
          expenseDate.isSame(selectedDate, "month")) ||
        (selectedTimeType === "Godišnje" &&
          expenseDate.isSame(selectedDate, "year"))
      );
    })
    .sort((a, b) => {
      if (sortBy === "Time") {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
        return sortAsc ? timeA - timeB : timeB - timeA;
      } else if (sortBy === "Name") {
        return sortAsc
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "Value") {
        return sortAsc ? a.price - b.price : b.price - a.price;
      }
    });
  const totalTroškovi = filteredData
    .filter((v) => v.type === "Trošak")
    .reduce((acc, v) => acc + v.price, 0);

  const totalPrihod = filteredData
    .filter((v) => v.type === "Prihod")
    .reduce((acc, v) => acc + v.price, 0);
  const balance = totalPrihod - totalTroškovi;

  const handleSelection = (type) => {
    setSelectedType(type);
    setSelectedCat(null);
    setItemsToShow(
      type == "Oboje"
        ? [...expensePickerItems, ...incomePickerItems].sort((a, b) => {
            if (a.name.startsWith("Ostali")) return 1;
            if (b.name.startsWith("Ostali")) return -1;
            return a.name.localeCompare(b.name);
          })
        : type == "Troškovi"
        ? expensePickerItems
        : incomePickerItems
    );
    scrollViewRef.current?.scrollTo({ x: 0, animated: true });
  };
  const handleTimeSelection = (type) => {
    setSelectedTimeType(type);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onAddDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateAdd;
    setShowAddDatePicker(false);
    if (event.type !== "dismissed") {
      setDateAdd(currentDate);
    }
  };

  const onAddTimeChange = (event, selectedDate) => {
    const currentTime = selectedDate || timeAdd;
    setShowAddTimePicker(false);
    if (event.type !== "dismissed") {
      setTimeAdd(currentTime);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={showDatepicker}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 40,
          borderWidth: 1,
          borderRadius: 20,
          backgroundColor: "#121212",
        }}
      >
        <Text
          style={{ color: "#fff", fontSize: 20, fontFamily: "Lato_400Regular" }}
        >
          Izaberi datum
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          is24Hour={true}
          display="spinner"
          onChange={onDateChange}
        />
      )}
      <StatusBar style="auto" />
      <Text
        style={{
          marginVertical: 10,
          fontFamily: "Lato_400Regular",
          fontSize: 24,
        }}
      >
        {selectedTimeType == "Dnevno"
          ? moment(date).format("DD.MM.YYYY.")
          : selectedTimeType == "Mjesečno"
          ? moment(date).format("MM. YYYY.")
          : moment(date).format("YYYY.")}
      </Text>

      <View
        style={{
          marginVertical: 7,
          display: "flex",
          flexDirection: "row",
          width: "80%",
          justifyContent: "space-around",
          borderColor: "#000",
          borderWidth: 1,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            backgroundColor:
              selectedTimeType === "Dnevno" ? "#121212" : undefined,
          }}
          onPress={() => handleTimeSelection("Dnevno")}
        >
          <Text
            style={{
              color: selectedTimeType === "Dnevno" ? "#fff" : "#000",
              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Dnevno
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            backgroundColor:
              selectedTimeType === "Mjesečno" ? "#121212" : undefined,
            borderLeftWidth: 1,
            borderRightWidth: 1,
          }}
          onPress={() => handleTimeSelection("Mjesečno")}
        >
          <Text
            style={{
              color: selectedTimeType === "Mjesečno" ? "#fff" : "#000",
              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Mjesečno
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            backgroundColor:
              selectedTimeType === "Godišnje" ? "#121212" : undefined,
          }}
          onPress={() => handleTimeSelection("Godišnje")}
        >
          <Text
            style={{
              color: selectedTimeType === "Godišnje" ? "#fff" : "#000",
              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Godišnje
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "80%",
          justifyContent: "space-around",
          borderColor: "#000",
          borderWidth: 1,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            backgroundColor: selectedType === "Oboje" ? "#121212" : undefined,
          }}
          onPress={() => handleSelection("Oboje")}
        >
          <Text
            style={{
              color: selectedType === "Oboje" ? "#fff" : "#000",

              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Oboje
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            backgroundColor:
              selectedType === "Troškovi" ? "#cc3300" : undefined,
            borderLeftWidth: 1,
            borderRightWidth: 1,
          }}
          onPress={() => handleSelection("Troškovi")}
        >
          <Text
            style={{
              fontFamily: "Lato_400Regular",
              fontSize: 18,
              textShadowColor:
                selectedType !== "Troškovi" ? undefined : "black",
              textShadowRadius: selectedType !== "Troškovi" ? undefined : 10,
              color: selectedType !== "Troškovi" ? undefined : "white",
            }}
          >
            Troškovi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            backgroundColor: selectedType === "Prihod" ? "#006600" : undefined,
          }}
          onPress={() => handleSelection("Prihod")}
        >
          <Text
            style={{
              fontFamily: "Lato_400Regular",
              fontSize: 18,
              textShadowColor: selectedType !== "Prihod" ? undefined : "black",
              textShadowRadius: selectedType !== "Prihod" ? undefined : 10,
              color: selectedType !== "Prihod" ? undefined : "white",
            }}
          >
            Prihod
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          borderColor: "#000",
          borderWidth: 1,
          borderRadius: 20,
          width: 100,
          overflow: "hidden",
          marginTop: 7,
        }}
      >
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
          }}
          onPress={() => {
            switch (sortBy) {
              case "Value":
                setSortBy("Time");
                return;
              case "Time":
                setSortBy("Name");
                return;
              case "Name":
                setSortBy("Value");
                return;
            }
          }}
        >
          {sortBy === "Value" && <FontAwesome5 name="euro-sign" size={18} />}
          {sortBy === "Time" && <FontAwesome5 name="calendar" size={18} />}
          {sortBy === "Name" && <FontAwesome5 name="font" size={18} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            borderLeftWidth: 1,
          }}
          onPress={() => setSortAsc(!sortAsc)}
        >
          <FontAwesome5 name={sortAsc ? "arrow-down" : "arrow-up"} size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        style={{ marginTop: 10, flexGrow: 0 }}
      >
        {itemsToShow.map((item) => (
          <TouchableOpacity
            onPress={() =>
              setSelectedCat(selectedCat == item.name ? null : item.name)
            }
            key={item.name}
            style={{
              backgroundColor: item.color,
              marginHorizontal: 10,
              height: 110,
              flexGrow: 1,
              aspectRatio: 1,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 1000,
              overflow: "hidden",
            }}
          >
            {selectedCat == item.name && (
              <View
                style={{
                  position: "absolute",
                  backgroundColor: "#0000ffaa",
                  zIndex: 9,
                  width: "200%",
                  height: "200%",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome5 name="times" size={64} color="white" />
              </View>
            )}
            <FontAwesome5
              name={item.icon}
              size={24}
              color="white"
              style={{
                textShadowColor: "black",
                textShadowRadius: 5,
              }}
            />
            <Text
              style={{
                color: "white",
                textShadowColor: "black",
                textShadowRadius: 5,
                textAlign: "center",
                fontSize: 14,
                paddingHorizontal: 10,
                fontFamily: "Lato_400Regular",
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {filteredData && filteredData.length > 0 ? (
        <ScrollView style={{ flex: 2, width: "95%", marginVertical: 10 }}>
          {filteredData
            .filter((v) => (selectedCat ? v.category == selectedCat : v))
            .map((v) => (
              <View
                key={v.id}
                style={{
                  backgroundColor: v.type == "Trošak" ? "#cc3300" : "#006600",
                  width: "100%",
                  padding: 20,
                  marginVertical: 5,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#000",
                }}
              >
                <View>
                  <View>
                    <Text
                      style={{
                        fontSize: 32,
                        fontFamily: "Lato_400Regular",
                        color: "#fff",
                      }}
                    >
                      {v.price}€
                    </Text>
                    <Text
                      style={{
                        fontSize: 22,
                        fontFamily: "Lato_400Regular",
                        color: "#fff",
                      }}
                    >
                      {v.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Lato_400Regular",
                        color: "#fff",
                      }}
                    >
                      {v.category}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Lato_400Regular",
                        color: "#fff",
                      }}
                    >
                      {moment(v.time).format(
                        selectedTimeType === "Dnevno" ? "HH:mm" : "DD.MM. HH:mm"
                      )}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Potvrdi brisanje",
                      "Da li ste sigurni da želite da uklonite " +
                        v.type.toLowerCase() +
                        ' "' +
                        v.name +
                        '"?',
                      [
                        {
                          text: "Ne",
                        },
                        {
                          text: "Da",
                          onPress: () => {
                            const updatedList = exInList.filter(
                              (entry) => entry.id !== v.id
                            );
                            setExInList(updatedList);
                            Alert.alert(
                              "Uspješno",
                              v.type + ' "' + v.name + '" uspješno uklonjen.'
                            );
                          },
                        },
                      ],
                      { cancelable: false }
                    );
                  }}
                >
                  <FontAwesome5 name="trash" size={32} color="white" />
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      ) : (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: "90%",
            flexGrow: 1,
          }}
        >
          <Text
            style={{
              fontFamily: "Lato_400Regular",
              fontSize: 24,
              textAlign: "center",
            }}
          >
            Nema
            {selectedType === "Oboje"
              ? " podataka"
              : selectedType === "Troškovi"
              ? " podataka o troškovima"
              : " podataka o prihodima"}{" "}
            za{"\n"}{" "}
            {selectedTimeType == "Dnevno"
              ? moment(date).format("DD.MM.YYYY.")
              : selectedTimeType == "Mjesečno"
              ? moment(date).format("MM. YYYY.")
              : moment(date).format("YYYY.")}
            {selectedCat && ' u kategoriji "' + selectedCat + '"'}
          </Text>
        </View>
      )}
      {filteredData.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 10,
            justifyContent:
              selectedType == "Oboje" ? "space-between" : "center",
            width: "90%",
            alignItems: "center",
          }}
        >
          {(selectedType == "Prihod" || selectedType == "Oboje") && (
            <View>
              <Text
                style={{
                  fontFamily: "Lato_400Regular",
                  fontSize: 26,
                  textAlign: "center",
                }}
              >
                {totalPrihod}€
              </Text>
              <Text
                style={{
                  fontFamily: "Lato_400Regular",
                  fontSize: 18,
                  textAlign: "center",
                }}
              >
                Prihod
              </Text>
            </View>
          )}
          {(selectedType == "Troškovi" || selectedType == "Oboje") && (
            <View>
              <Text
                style={{
                  fontFamily: "Lato_400Regular",
                  fontSize: 26,
                  textAlign: "center",
                }}
              >
                {totalTroškovi}€
              </Text>
              <Text
                style={{
                  fontFamily: "Lato_400Regular",
                  fontSize: 18,
                  textAlign: "center",
                }}
              >
                Trošak
              </Text>
            </View>
          )}
          {selectedType == "Oboje" && (
            <View>
              <Text
                style={{
                  fontFamily: "Lato_400Regular",
                  fontSize: 26,
                  textAlign: "center",
                }}
              >
                {balance}€
              </Text>
              <Text
                style={{
                  fontFamily: "Lato_400Regular",
                  fontSize: 18,
                  textAlign: "center",
                }}
              >
                Balans
              </Text>
            </View>
          )}
        </View>
      )}
      <Modal visible={addModalVisible} animationType="slide">
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              backgroundColor: "#fff",
              alignItems: "center",
              width: "auto",
            }}
          >
            <TextInput
              maxLength={20}
              autoFocus
              placeholder="Naziv"
              style={{
                fontSize: 16,
                borderWidth: 1,
                borderRadius: 8,
                padding: 10,
                width: "100%",
                fontFamily: "Lato_400Regular",
              }}
              value={newEntryName}
              onChangeText={(text) => setNewEntryName(text)}
            />
            <TextInput
              maxLength={10}
              placeholder="Količina"
              style={{
                fontSize: 16,
                width: "100%",
                marginTop: 5,
                borderRadius: 8,
                borderWidth: 1,
                padding: 10,
                fontFamily: "Lato_400Regular",
              }}
              value={newEntryPrice}
              onChangeText={(text) => setNewEntryPrice(text)}
              keyboardType="numeric"
            />
            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                width: "100%",
                marginTop: 5,
              }}
            >
              <Picker
                style={{
                  width: "100%",
                }}
                mode="dropdown"
                placeholder="Type"
                selectedValue={selectedEntryType}
                onValueChange={(itemValue) => {
                  setSelectedEntryType(itemValue);
                  setSelectedCategory(
                    itemValue == "Trošak"
                      ? expensePickerItems[0].name
                      : incomePickerItems[0].name
                  );
                }}
              >
                <Picker.Item key="Trošak" label="Trošak" value="Trošak" />
                <Picker.Item key="Prihod" label="Prihod" value="Prihod" />
              </Picker>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                width: "100%",
                marginVertical: 5,
              }}
            >
              {selectedEntryType == "Trošak" ? (
                <Picker
                  mode="dropdown"
                  style={{ width: "100%" }}
                  placeholder="Kategorija"
                  selectedValue={selectedCategory}
                  onValueChange={(itemValue) => {
                    setSelectedCategory(itemValue);
                  }}
                >
                  {expensePickerItems.map((v) => (
                    <Picker.Item key={v.name} label={v.name} value={v.name} />
                  ))}
                </Picker>
              ) : (
                <Picker
                  style={{ width: "100%" }}
                  placeholder="Kategorija"
                  selectedValue={selectedCategory}
                  onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                >
                  {incomePickerItems.map((v) => (
                    <Picker.Item key={v.name} label={v.name} value={v.name} />
                  ))}
                </Picker>
              )}
            </View>
            {showAddDatePicker && dateAdd && (
              <DateTimePicker
                value={dateAdd}
                mode="date"
                is24Hour={true}
                display="spinner"
                onChange={onAddDateChange}
              />
            )}
            <View
              style={{
                flex: 1,
                flexGrow: 0,
                flexDirection: "row",
                justifyContent: "center",
                width: "90%",
                borderRadius: 30,
                borderWidth: 1,
                overflow: "hidden",
                marginTop: 15,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowAddDatePicker(true);
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Lato_400Regular",
                    textAlign: "center",
                    marginRight: 10,
                  }}
                >
                  {moment(
                    `${moment(dateAdd).format("YYYY-MM-DD")}`,
                    "YYYY-MM-DD"
                  ).format("DD.MM.YYYY")}
                </Text>
              </TouchableOpacity>
              {showAddTimePicker && (
                <DateTimePicker
                  value={timeAdd}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onAddTimeChange}
                />
              )}

              <TouchableOpacity
                onPress={() => {
                  setShowAddTimePicker(true);
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderLeftWidth: 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Lato_400Regular",
                    marginRight: 10,
                  }}
                >
                  {moment(`${moment(timeAdd).format("HH:mm")}`, "HH:mm").format(
                    "HH:mm"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
            <Text>Klikni datum / vrijeme da ga promijeniš</Text>
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 30,
                borderWidth: 1,
                borderRadius: 20,
                marginVertical: 10,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#121212",
              }}
              onPress={() => {
                handleAddEntry();
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontFamily: "Lato_400Regular",
                }}
              >
                Dodaj
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 30,
                borderWidth: 1,
                borderRadius: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#121212",
              }}
              onPress={() => {
                setAddModalVisible(false);
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontFamily: "Lato_400Regular",
                }}
              >
                Otkaži
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      <TouchableOpacity
        style={{
          paddingVertical: 10,
          paddingHorizontal: 30,
          borderWidth: 1,
          borderRadius: 20,
          marginVertical: 20,
          width: "90%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#121212",
        }}
        onPress={() => {
          setDateAdd(new Date());
          setTimeAdd(new Date());
          setAddModalVisible(true);
        }}
      >
        <Text style={{ fontSize: 20, color: "#fff" }}>Dodaj</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  selectionBtn: {
    padding: 10,
    flexGrow: 1,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    marginTop: Constants.statusBarHeight + 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
