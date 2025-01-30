import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import { Card } from "react-native-paper";
import {
  HallDetailsContainer,
  HallImageContainer,
  Heading,
  JobLocation,
  Row,
  TopHeader,
} from "../../styles/dashboard.styles";
import { getImageUrl } from "../../services/socialMedia.services";

export default function CommunityMemberCard(props) {
  const { image, title, name, imgContainerStyle } = props;
  const [imaging, setImaging] = useState();

  useEffect(() => {
    const onHelper = async () => {
      const res = await getImageUrl(image);
      setImaging(res.url);
    };
    onHelper();
  }, []);

  return (
    <Card
      style={{
        marginVertical: 8,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginHorizontal: 2,
        elevation: 3,
      }}
    >
      <Card.Content style={{ flexDirection: "row" }}>
        <HallImageContainer style={imgContainerStyle}>
          {image !== undefined ? (
            <Image
              style={{ width: 70, height: 50 }}
              source={{ uri: imaging }}
            />
          ) : (
            <Image
              style={{ width: 50, height: 50, opacity: 0.4 }}
              source={{
                uri: "https://www.kindpng.com/picc/m/120-1209701_silhouette-vector-graphics-clip-art-male-image-headshot.png",
              }}
            />
          )}
        </HallImageContainer>
        <HallDetailsContainer>
          <TopHeader>
            <Heading>{name}</Heading>
          </TopHeader>
          <Row>
            <JobLocation>{title}</JobLocation>
          </Row>
        </HallDetailsContainer>
      </Card.Content>
    </Card>
  );
}
