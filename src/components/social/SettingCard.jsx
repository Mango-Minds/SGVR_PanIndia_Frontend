import React from "react";
import { Card, Divider, IconButton } from "react-native-paper";
import { TouchableOpacity } from "react-native";

export default function SettingCard(props) {
  const { name, callback, isDestructive } = props;
  return (
    <TouchableOpacity
      onPress={callback}
      style={{ backgroundColor: "#D4AF371A" }}
      activeOpacity={0.75}
    >
      <Card
        style={{
          shadowColor: "#00000014",
          // backgroundColor: 'white',
        }}
      >
                        <Card.Title
                  title={name}
                  titleStyle={{
                    fontSize: 16,
                    color: isDestructive ? '#DC3545' : '#000000'
                  }}
                  subtitleStyle={{ fontSize: 12, color: "#454F63" }}
                  right={(props) => <IconButton icon="chevron-right" />}
                />
        <Divider />
      </Card>
    </TouchableOpacity>
  );
}
