import "react-native-url-polyfill/auto";
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
import { BarCodeScanner } from "expo-barcode-scanner";
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
  const [scanned, setScanned] = useState(false);
  const [invoiceArray, setInvoiceArray] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
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

  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [showInvoiceTimePicker, setShowInvoiceTimePicker] = useState(false);
  const [invoiceDateAdd, setInvoiceDateAdd] = useState(new Date());
  const [invoiceTimeAdd, setInvoiceTimeAdd] = useState(new Date());
  const [fontsLoaded] = useFonts({
    Lato_400Regular,
  });
  const expensePickerItems = [
    { name: "Ostali troškovi", icon: "ellipsis-h" },
    { name: "Elektronika", icon: "laptop" },
    { name: "Ishrana", icon: "utensils" },
    { name: "Krediti", icon: "hand-holding-usd" },
    { name: "Komunalije", icon: "bolt" },
    { name: "Lična higijena", icon: "user" },
    { name: "Namirnice", icon: "shopping-cart" },
    { name: "Namještaj", icon: "couch" },
    { name: "Obrazovanje", icon: "book" },
    { name: "Odjeća", icon: "tshirt" },
    { name: "Porezi", icon: "file-invoice-dollar" },
    { name: "Putovanja", icon: "plane" },
    { name: "Stanarina", icon: "home" },
    { name: "Transport", icon: "car" },
    { name: "Zabava", icon: "film" },
    { name: "Zdravlje", icon: "heartbeat" },
  ];
  const [selectedCategory, setSelectedCategory] = useState(
    expensePickerItems[0].name
  );
  const incomePickerItems = [
    { name: "Ostali prihodi", icon: "ellipsis-h" },
    { name: "Dividende", icon: "file-invoice-dollar" },
    { name: "Honorari", icon: "file-contract" },
    { name: "Investicije", icon: "chart-line" },
    { name: "Naknada", icon: "user-clock" },
    {
      name: "Osiguranje",
      icon: "universal-access",
    },
    { name: "Penzija", icon: "piggy-bank" },
    { name: "Plata", icon: "money-bill-wave" },
    { name: "Pokloni", icon: "gift", color: "#0B6623" },
    {
      name: "Stipendije",
      icon: "graduation-cap",
      color: "#004D40",
    },
  ];
  const [itemsToShow, setItemsToShow] = useState(
    [...expensePickerItems, ...incomePickerItems].sort((a, b) => {
      if (a.name.startsWith("Ostali")) return 1;
      if (b.name.startsWith("Ostali")) return -1;
      return a.name.localeCompare(b.name);
    })
  );
  function calculateTotalValue(v) {
    sum = 0;
    for (let i of filteredData) {
      if (i.category == v) {
        sum += i.price;
      }
    }
    return sum;
  }
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
      `${moment(dateAdd).format("DD.MM.YYYY.")} ${moment(timeAdd).format(
        "HH:mm:ss"
      )}`,
      "DD.MM.YYYY. HH:mm:ss"
    );

    if (newEntryName.trim().length === 0) {
      Alert.alert("Greška", "Naziv nije unešen.");
      return;
    }
    const priceValue = parseFloat(newEntryPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert("Greška", "Količina mora biti izražena brojem većim od 0.");
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
        ? expensePickerItems.sort((a, b) => {
            if (a.name.startsWith("Ostali")) return 1;
            if (b.name.startsWith("Ostali")) return -1;
            return a.name.localeCompare(b.name);
          })
        : incomePickerItems.sort((a, b) => {
            if (a.name.startsWith("Ostali")) return 1;
            if (b.name.startsWith("Ostali")) return -1;
            return a.name.localeCompare(b.name);
          })
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
  const onInvoiceDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowInvoiceDatePicker(false);
    setInvoiceDateAdd(currentDate);
    const dateStr = `${moment(currentDate).format("DD.MM.YYYY")} ${moment(
      invoiceTimeAdd
    ).format("HH:mm:ss")}`;
    const dateToMoment = moment(dateStr, "DD.MM.YYYY HH:mm:ss");
    setInvoiceArray((prevArray) =>
      prevArray.map((invoiceItem) => ({
        ...invoiceItem,
        time: dateToMoment,
      }))
    );
  };

  const onInvoiceTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowInvoiceTimePicker(false);
    setInvoiceTimeAdd(currentTime);
    const dateStr = `${moment(invoiceDateAdd).format("DD.MM.YYYY")} ${moment(
      currentTime
    ).format("HH:mm:ss")}`;
    const dateToMoment = moment(dateStr, "DD.MM.YYYY HH:mm:ss");
    setInvoiceArray((prevArray) =>
      prevArray.map((invoiceItem) => ({
        ...invoiceItem,
        time: dateToMoment,
      }))
    );
  };
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    const url = new URL(data);
    const params = {};
    if (url.hostname === "mapr.tax.gov.me") {
      const fragment = url.toString().split("#/verify?")[1];
      const pairs = fragment.split("&");
      pairs.forEach((pair) => {
        const [key, value] = pair.split("=");
        params[key] = decodeURIComponent(value);
      });
      const iic = params["iic"];
      const tin = params["tin"];
      const crtd = params["crtd"];
      fetch(
        "https://mapr.tax.gov.me/ic/api/verifyInvoice?iic=" +
          iic +
          "&tin=" +
          tin +
          "&dateTimeCreated=" +
          crtd,
        { method: "POST" }
      )
        .then((response) => response.json())
        .then((json) => {
          const dateTime = moment(json.dateTimeCreated);

          setInvoiceDateAdd(dateTime.toDate());
          setInvoiceTimeAdd(dateTime.toDate());
          const dateStr = `${moment(dateTime.toDate()).format(
            "DD.MM.YYYY"
          )} ${moment(dateTime).format("HH:mm:ss")}`;
          const dateToMoment = moment(dateStr, "DD.MM.YYYY HH:mm:ss");
          const newArray = json.items.map((item) => ({
            id: Crypto.randomUUID(),
            name: item.name.trim(),
            price: item.priceAfterVat,
            category: expensePickerItems[0].name,
            type: "Trošak",
            time: dateToMoment,
          }));
          setInvoiceArray(newArray);
        })

        .catch((e) => {
          Alert.alert("Greška", "Greška pri učitavanju podataka sa servera.");
        })
        .finally(() => {
          setScannerVisible(false);
        });
    } else {
      Alert.alert("Greška", "QR kod nije validan.");
      setScannerVisible(false);
    }
  };

  return invoiceArray && invoiceArray.length > 0 ? (
    <View
      style={{
        ...styles.container,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          textAlign: "center",
          marginBottom: 20,
          fontFamily: "Lato_400Regular",
        }}
      >
        Proizvodi sa računa
      </Text>
      <Text
        style={{
          fontSize: 18,
          textAlign: "center",
          marginBottom: 20,
          fontFamily: "Lato_400Regular",
        }}
      >
        {"Ukupno: " +
          invoiceArray.reduce((sum, item) => sum + item.price, 0).toFixed(2) +
          "€"}
      </Text>
      {showInvoiceDatePicker && (
        <DateTimePicker
          value={invoiceDateAdd}
          mode="date"
          display="default"
          onChange={onInvoiceDateChange}
        />
      )}

      {showInvoiceTimePicker && (
        <DateTimePicker
          value={invoiceTimeAdd}
          mode="time"
          display="default"
          onChange={onInvoiceTimeChange}
        />
      )}
      <ScrollView
        style={{
          width: "90%",
        }}
      >
        {invoiceArray.map((item) => (
          <View
            key={item.id}
            style={{
              marginVertical: 10,
              backgroundColor: "#cc3300",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 20,
              borderWidth: 1,
              borderRadius: 20,
            }}
          >
            <TextInput
              defaultValue={item.name.trim()}
              onChangeText={(e) => {
                setInvoiceArray((prevArray) =>
                  prevArray.map((invoiceItem) =>
                    invoiceItem.id === item.id
                      ? { ...invoiceItem, name: e.trim() }
                      : invoiceItem
                  )
                );
              }}
              style={{
                color: "#fff",
                borderWidth: 1,
                width: "80%",
                borderColor: "#fff",
                borderRadius: 20,
                fontSize: 18,
                paddingLeft: 10,
                paddingVertical: 10,
                textAlign: "left",
                fontFamily: "Lato_400Regular",
              }}
            />
            <TextInput
              keyboardType="numeric"
              inputMode="numeric"
              defaultValue={item.price.toString()}
              onChangeText={(e) => {
                const formattedValue = e.replace(",", ".");
                if (!isNaN(formattedValue)) {
                  setInvoiceArray((prevArray) =>
                    prevArray.map((invoiceItem) =>
                      invoiceItem.id === item.id
                        ? { ...invoiceItem, price: formattedValue }
                        : invoiceItem
                    )
                  );
                }
              }}
              style={{
                color: "#fff",
                borderWidth: 1,
                width: "80%",
                borderColor: "#fff",
                borderRadius: 20,
                fontSize: 18,
                paddingLeft: 10,
                paddingVertical: 10,
                textAlign: "left",
                fontFamily: "Lato_400Regular",
                marginTop: 10,
              }}
            />
            <View
              style={{
                width: "80%",
                borderWidth: 1,
                borderColor: "#fff",
                borderRadius: 20,
                marginTop: 10,
              }}
            >
              <Picker
                onValueChange={(value) => {
                  setInvoiceArray((prevArray) =>
                    prevArray.map((invoiceItem) =>
                      invoiceItem.id === item.id
                        ? { ...invoiceItem, category: value }
                        : invoiceItem
                    )
                  );
                }}
                selectedValue={item.category}
                mode="dropdown"
                placeholder="Kategorija"
                style={{
                  color: "#fff",
                  width: "100%",
                }}
              >
                {expensePickerItems.map((v) => (
                  <Picker.Item key={v.name} label={v.name} value={v.name} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: "#fff",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 20,
                borderWidth: 1,
                width: "40%",
                marginTop: 20,
                alignSelf: "center",
                marginBottom: 10,
              }}
              onPress={() => {
                setInvoiceArray(invoiceArray.filter((v) => v.id !== item.id));
              }}
            >
              <Text
                style={{
                  color: "#000",
                  fontSize: 18,
                  textAlign: "center",
                  fontFamily: "Lato_400Regular",
                }}
              >
                Izbriši
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View
        style={{
          height: 60,
          flexDirection: "row",
          justifyContent: "center",
          borderRadius: 30,
          borderWidth: 1,
          overflow: "hidden",
          backgroundColor: "#fff",
          marginTop: 15,
          paddingHorizontal: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setShowInvoiceDatePicker(true);
          }}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 20,
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Lato_400Regular",
              textAlign: "center",
              marginRight: 10,
            }}
          >
            {moment(invoiceDateAdd).format("DD.MM.YYYY.")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setShowInvoiceTimePicker(true);
          }}
          style={{
            borderLeftWidth: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Lato_400Regular",
              marginLeft: 10,
            }}
          >
            {moment(invoiceTimeAdd).format("HH:mm")}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100%",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            borderWidth: 1,
            width: "40%",
            marginTop: 20,
            alignSelf: "center",
            marginBottom: 10,
          }}
          onPress={() => {
            const roundedInvoiceArray = invoiceArray.map((item) => ({
              ...item,
              price: parseFloat(parseFloat(item.price).toFixed(2)),
            }));

            // Data validation checks
            const isValidNumber = roundedInvoiceArray.every((item) => {
              const price = parseFloat(item.price);
              return !isNaN(price) && price > 0;
            });

            const isValidName = roundedInvoiceArray.every((item) => {
              const name = item.name;
              return name && name.trim().length > 0;
            });

            if (isValidNumber && isValidName) {
              setExInList([...exInList, ...roundedInvoiceArray]);
              Alert.alert("Uspješno", "Proizvodi sa računa uspješno dodati.");
              setInvoiceArray(null);
            } else if (!isValidName) {
              Alert.alert("Greška", "Naziv proizvoda nije unešen.");
            } else if (!isValidNumber) {
              Alert.alert(
                "Greška",
                "Vrijednosti proizvoda moraju biti veće od 0."
              );
            }
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Dodaj
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            borderWidth: 1,
            width: "40%",
            marginTop: 20,
            alignSelf: "center",
            marginBottom: 10,
          }}
          onPress={() => {
            setInvoiceArray(null);
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Otkaži
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : scannerVisible ? (
    <View
      style={{
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ width: "100%", flexGrow: 1, aspectRatio: 1 }}
      />
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 20,
          backgroundColor: "black",
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 20,
          width: "90%",
          height: 50,
        }}
        onPress={() => setScannerVisible(false)}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 24,
            textAlign: "center",
            fontFamily: "Lato_400Regular",
          }}
        >
          Zatvori kameru
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
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
              backgroundColor: expensePickerItems.some(
                (expenseItem) => expenseItem.name === item.name
              )
                ? "#cc3300"
                : "#006600",
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
            {!selectedCat && (
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
                {calculateTotalValue(item.name).toFixed(2)}€
              </Text>
            )}
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
                      {v.price.toFixed(2)}€
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
                {totalPrihod.toFixed(2)}€
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
                {totalTroškovi.toFixed(2)}€
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
                {balance.toFixed(2)}€
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
              placeholder="Vrijednost"
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
              onChangeText={(text) => {
                const formattedText = text.replace(",", ".");

                setNewEntryPrice(formattedText);
              }}
              inputMode="numeric"
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
                    `${moment(dateAdd).format("DD.MM.YYYY.")}`,
                    "DD.MM.YYYY."
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
            <Text
              style={{
                fontFamily: "Lato_400Regular",
              }}
            >
              Klikni datum / vrijeme da ga promijeniš
            </Text>
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 30,
                borderWidth: 1,
                borderRadius: 20,
                marginTop: 20,
                marginBottom: 10,
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "black",
            padding: 10,
            marginLeft: 10,
            borderRadius: 50,
            flexDirection: "row",
            fontSize: 18,
            paddingVertical: 10,
            paddingHorizontal: 30,
          }}
          onPress={() => {
            const getBarCodeScannerPermissions = async () => {
              const { status } = await BarCodeScanner.requestPermissionsAsync();
              status === "denied" &&
                Alert.alert(
                  "Greška",
                  "Aplikacija nema dozvolu za korišćenje kamere."
                );
              setScanned(false);
              setHasPermission(status === "granted");
              setScannerVisible(status === "granted");
            };

            getBarCodeScannerPermissions();
          }}
        >
          <Text
            style={{
              color: "white",
              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Skeniraj QR kod
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingVertical: 10,
            paddingHorizontal: 30,
            borderRadius: 20,
            marginVertical: 20,
            marginHorizontal: 20,
            flex: 1,
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
          <Text
            style={{
              fontSize: 20,
              color: "#fff",
              fontFamily: "Lato_400Regular",
            }}
          >
            Dodaj
          </Text>
        </TouchableOpacity>
      </View>
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
    marginTop: Constants.statusBarHeight + 20,
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
