import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import GroupsScreen from './src/screens/GroupsScreen';
import GroupDetailsScreen from './src/screens/GroupDetailsScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import SettlementScreen from './src/screens/SettlementScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Groups"
          component={GroupsScreen}
          options={{
  title: 'My Groups',
  headerTitleAlign: 'left',
}}
        />

        <Stack.Screen
          name="GroupDetails"
          component={GroupDetailsScreen}
          options={{title: 'Group Details'}}
        />

        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={{title: 'Add Expense'}}
        />

        <Stack.Screen
          name="Settlement"
          component={SettlementScreen}
          options={{title: 'Settlement'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
