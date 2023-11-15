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
  const [exInList, setExInList] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const scrollViewRef = useRef(null);
  const [selectedType, setSelectedType] = useState("Both");
  const [selectedTimeType, setSelectedTimeType] = useState("Daily");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateAdd, setDateAdd] = useState(new Date());
  const [timeAdd, setTimeAdd] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddDatePicker, setShowAddDatePicker] = useState(false);
  const [showAddTimePicker, setShowAddTimePicker] = useState(false);
  const [newEntryName, setNewEntryName] = useState("");
  const [newEntryPrice, setNewEntryPrice] = useState("");
  const [selectedEntryType, setSelectedEntryType] = useState("Expense");
  const [fontsLoaded] = useFonts({
    Lato_400Regular,
  });
  const expensePickerItems = [
    { name: "Entertainment", icon: "film", color: "#cc3300" },
    { name: "Utilities", icon: "bolt", color: "#cc9900" },
    { name: "Rent", icon: "home", color: "#330099" },
    { name: "Transportation", icon: "car", color: "#0033cc" },
    { name: "Travel", icon: "plane", color: "#006633" },
    { name: "Education", icon: "book", color: "#cc3300" },
    { name: "Clothing", icon: "tshirt", color: "#660099" },
    { name: "Health", icon: "heartbeat", color: "#990033" },
    { name: "Other expenses", icon: "ellipsis-h", color: "#cc3333" },
    { name: "Groceries", icon: "shopping-cart", color: "#800000" },
    { name: "Dining", icon: "utensils", color: "#808000" },
    { name: "Personal Care", icon: "user", color: "#008080" },
    { name: "Electronics", icon: "laptop", color: "#008000" },
    { name: "Furniture", icon: "couch", color: "#8000ff" },
    { name: "Insurance", icon: "shield-alt", color: "#ff0000" },
    { name: "Loans", icon: "hand-holding-usd", color: "#00ff00" },
    { name: "Taxes", icon: "file-invoice-dollar", color: "#0000ff" },
    { name: "Savings", icon: "piggy-bank", color: "#ff00ff" },
  ].sort((a, b) => {
    if (a.name.startsWith("Other")) return 1;
    if (b.name.startsWith("Other")) return -1;
    return a.name.localeCompare(b.name);
  });
  const [selectedCategory, setSelectedCategory] = useState(
    expensePickerItems[0].name
  );
  const incomePickerItems = [
    { name: "Salary", icon: "money-bill-wave", color: "#006600" },
    { name: "Investments", icon: "chart-line", color: "#cc9900" },
    { name: "Freelance", icon: "laptop-code", color: "#330066" },
    { name: "Rental", icon: "home", color: "#cc3300" },
    { name: "Other income", icon: "ellipsis-h", color: "#003300" },
    { name: "Dividends", icon: "file-invoice-dollar", color: "#800000" },
    { name: "Interest", icon: "percent", color: "#808000" },
    { name: "Gifts", icon: "gift", color: "#008080" },
    { name: "Sale of Property", icon: "hand-holding-usd", color: "#800080" },
    { name: "Royalties", icon: "file-contract", color: "#008000" },
    { name: "Retirement", icon: "piggy-bank", color: "#8000ff" },
    { name: "Alimony", icon: "handshake", color: "#ff0000" },
    { name: "Child Support", icon: "child", color: "#006600" },
    { name: "Social Security", icon: "universal-access", color: "#0000ff" },
    { name: "Unemployment Benefits", icon: "user-clock", color: "#ff00ff" },
  ].sort((a, b) => {
    if (a.name.startsWith("Other")) return 1;
    if (b.name.startsWith("Other")) return -1;
    return a.name.localeCompare(b.name);
  });
  const [itemsToShow, setItemsToShow] = useState(
    [...expensePickerItems, ...incomePickerItems].sort((a, b) => {
      if (a.name.startsWith("Other")) return 1;
      if (b.name.startsWith("Other")) return -1;
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
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
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
      alert("Please enter a valid name.");
      return;
    }
    const priceValue = parseFloat(newEntryPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert("Amount should be a number above 0");
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
    Alert.alert("Success", selectedEntryType + " added successfully");
    setAddModalVisible(false);
    setNewEntryName("");
    setNewEntryPrice("");
    setSelectedEntryType("Expense");
    setDateAdd(Date.now());
    setSelectedCategory(expensePickerItems[0].name);
  };

  const filteredData = exInList
    .filter((v) => {
      return selectedType == "Both"
        ? v
        : selectedType == "Expenses"
        ? v.type == "Expense"
        : v.type == "Income";
    })
    .filter((v) => {
      return selectedCat ? v.category == selectedCat : v;
    })
    .filter((v) => {
      const expenseDate = moment(v.time);
      const selectedDate = moment(date);

      return (
        (selectedTimeType === "Daily" &&
          expenseDate.isSame(selectedDate, "day")) ||
        (selectedTimeType === "Monthly" &&
          expenseDate.isSame(selectedDate, "month")) ||
        (selectedTimeType === "Yearly" &&
          expenseDate.isSame(selectedDate, "year"))
      );
    })
    .sort((a, b) => {
      return moment(b.time, "DD.MM.YYYY HH:mm:ss").diff(
        moment(a.time, "DD.MM.YYYY HH:mm:ss")
      );
    });
  const totalExpenses = filteredData
    .filter((v) => v.type === "Expense")
    .reduce((acc, v) => acc + v.price, 0);

  const totalIncome = filteredData
    .filter((v) => v.type === "Income")
    .reduce((acc, v) => acc + v.price, 0);
  const balance = totalIncome - totalExpenses;

  const handleSelection = (type) => {
    setSelectedType(type);
    setSelectedCat(null);
    setItemsToShow(
      type == "Both"
        ? [...expensePickerItems, ...incomePickerItems].sort((a, b) => {
            if (a.name.startsWith("Other")) return 1;
            if (b.name.startsWith("Other")) return -1;
            return a.name.localeCompare(b.name);
          })
        : type == "Expenses"
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
    setShowAddDatePicker(false);
    if (selectedDate) {
      setDateAdd(selectedDate);
    }
  };

  const onAddTimeChange = (event, selectedDate) => {
    setShowAddTimePicker(false);
    if (selectedDate) {
      setTimeAdd(selectedDate);
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
          Select date
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
        {selectedTimeType == "Daily"
          ? moment(date).format("DD.MM.YYYY.")
          : selectedTimeType == "Monthly"
          ? moment(date).format("MMMM YYYY")
          : moment(date).format("YYYY")}
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
              selectedTimeType === "Daily" ? "#121212" : undefined,
          }}
          onPress={() => handleTimeSelection("Daily")}
        >
          <Text
            style={{
              color: selectedTimeType === "Daily" ? "#fff" : "#000",
              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Daily
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            backgroundColor:
              selectedTimeType === "Monthly" ? "#121212" : undefined,
          }}
          onPress={() => handleTimeSelection("Monthly")}
        >
          <Text
            style={{
              color: selectedTimeType === "Monthly" ? "#fff" : "#000",
              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            backgroundColor:
              selectedTimeType === "Yearly" ? "#121212" : undefined,
          }}
          onPress={() => handleTimeSelection("Yearly")}
        >
          <Text
            style={{
              color: selectedTimeType === "Yearly" ? "#fff" : "#000",
              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Yearly
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
            backgroundColor: selectedType === "Both" ? "#121212" : undefined,
          }}
          onPress={() => handleSelection("Both")}
        >
          <Text
            style={{
              color: selectedType === "Both" ? "#fff" : "#000",

              fontFamily: "Lato_400Regular",
              fontSize: 18,
            }}
          >
            Both
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            backgroundColor:
              selectedType === "Expenses" ? "#cc3300" : undefined,
          }}
          onPress={() => handleSelection("Expenses")}
        >
          <Text
            style={{
              fontFamily: "Lato_400Regular",
              fontSize: 18,
              textShadowColor:
                selectedType !== "Expenses" ? undefined : "black",
              textShadowRadius: selectedType !== "Expenses" ? undefined : 10,
              color: selectedType !== "Expenses" ? undefined : "white",
            }}
          >
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.selectionBtn,
            backgroundColor: selectedType === "Income" ? "#006600" : undefined,
          }}
          onPress={() => handleSelection("Income")}
        >
          <Text
            style={{
              fontFamily: "Lato_400Regular",
              fontSize: 18,
              textShadowColor: selectedType !== "Income" ? undefined : "black",
              textShadowRadius: selectedType !== "Income" ? undefined : 10,
              color: selectedType !== "Income" ? undefined : "white",
            }}
          >
            Income
          </Text>
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
                fontFamily: "Lato_400Regular",
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {filteredData && filteredData.length > 0 ? (
        <ScrollView
          style={{
            width: "95%",
            maxHeight: 250,
            marginVertical: 10,
          }}
        >
          {filteredData
            .filter((v) => (selectedCat ? v.category == selectedCat : v))
            .map((v) => (
              <View
                key={v.id}
                style={{
                  backgroundColor: v.type == "Expense" ? "#cc3300" : "#006600",
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
                        selectedTimeType === "Daily" ? "HH:mm" : "DD.MM. HH:mm"
                      )}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Confirm deletion",
                      "Are you sure you want to delete " +
                        v.name +
                        " from the list",
                      [
                        {
                          text: "No",
                        },
                        {
                          text: "Yes",
                          onPress: () => {
                            const updatedList = exInList.filter(
                              (entry) => entry.id !== v.id
                            );
                            setExInList(updatedList);
                            Alert.alert("Success", "Deleted successfully");
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
            No{" "}
            {selectedType === "Both"
              ? "data"
              : selectedType === "Expenses"
              ? "expense data"
              : "income data"}{" "}
            found for{"\n"}{" "}
            {selectedTimeType == "Daily"
              ? moment(date).format("DD.MM.YYYY.")
              : selectedTimeType == "Monthly"
              ? moment(date).format("MMMM YYYY")
              : moment(date).format("YYYY")}
            {selectedCat && " in " + selectedCat + " category"}
          </Text>
        </View>
      )}
      {filteredData.length > 0 && (
        <View>
          {(selectedType == "Income" || selectedType == "Both") && (
            <Text
              style={{
                fontFamily: "Lato_400Regular",
                fontSize: 18,
              }}
            >
              Total income: {totalIncome}€
            </Text>
          )}
          {(selectedType == "Expenses" || selectedType == "Both") && (
            <Text
              style={{
                fontFamily: "Lato_400Regular",
                fontSize: 18,
              }}
            >
              Total expenses: {totalExpenses}€
            </Text>
          )}
          {selectedType == "Both" && (
            <Text
              style={{
                fontFamily: "Lato_400Regular",
                fontSize: 18,
              }}
            >
              Balance: {balance}€
            </Text>
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
              placeholder="Name"
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
              placeholder="Amount"
              style={{
                fontSize: 16,
                width: "100%",
                marginTop: 10,
                borderRadius: 8,
                borderWidth: 1,
                padding: 10,
                fontFamily: "Lato_400Regular",
              }}
              value={newEntryPrice}
              onChangeText={(text) => setNewEntryPrice(text)}
              keyboardType="numeric"
            />
            <Picker
              style={{ width: "100%" }}
              mode="dropdown"
              placeholder="Type"
              selectedValue={selectedEntryType}
              onValueChange={(itemValue) => {
                setSelectedEntryType(itemValue);
                setSelectedCategory(
                  itemValue == "Expense"
                    ? expensePickerItems[0].name
                    : incomePickerItems[0].name
                );
              }}
            >
              <Picker.Item key="Expense" label="Expense" value="Expense" />
              <Picker.Item key="Income" label="Income" value="Income" />
            </Picker>
            {selectedEntryType == "Expense" ? (
              <Picker
                mode="dropdown"
                style={{ width: "100%" }}
                placeholder="Category"
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
                placeholder="Category"
                selectedValue={selectedCategory}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              >
                {incomePickerItems.map((v) => (
                  <Picker.Item key={v.name} label={v.name} value={v.name} />
                ))}
              </Picker>
            )}

            <Text
              style={{
                fontSize: 20,
                marginVertical: 10,
                fontFamily: "Lato_400Regular",
              }}
            >
              {moment(
                `${moment(dateAdd).format("YYYY-MM-DD")} ${moment(
                  timeAdd
                ).format("HH:mm:ss")}`,
                "YYYY-MM-DD HH:mm:ss"
              ).format("DD.MM.YYYY HH:mm")}
            </Text>
            {showAddDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                is24Hour={true}
                display="spinner"
                onChange={onAddDateChange}
              />
            )}

            <TouchableOpacity
              onPress={() => {
                setShowAddDatePicker(true);
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 40,
                borderWidth: 1,
                borderRadius: 20,
                marginTop: 5,
                backgroundColor: "#121212",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontFamily: "Lato_400Regular",
                }}
              >
                Edit date
              </Text>
            </TouchableOpacity>
            {showAddTimePicker && (
              <DateTimePicker
                value={date}
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
                paddingHorizontal: 40,
                borderWidth: 1,
                borderRadius: 20,
                marginTop: 5,
                backgroundColor: "#121212",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontFamily: "Lato_400Regular",
                }}
              >
                Edit time
              </Text>
            </TouchableOpacity>
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
                Add
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
                Cancel
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
          setDateAdd(Date.now());
          setTimeAdd(Date.now());
          setAddModalVisible(true);
        }}
      >
        <Text style={{ fontSize: 20, color: "#fff" }}>Add</Text>
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
    marginTop: Constants.statusBarHeight + 20,
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
