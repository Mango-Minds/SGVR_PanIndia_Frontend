import React from "react";
import { View, Text, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import { IconButton } from "react-native-paper";
import Theme from "../styles/theme";
const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ marginTop: 55 }}>
      <View style={{ padding: 5, marginBottom: 100 }}>
        <View style={styles.container}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.Heading}>Privacy Policy</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20, marginTop: 0 }}>
            <Text style={styles.privacytext}>
              This privacy policy sets out how SGVR TECH uses and protects any
              information that you give SGVR TECH when you use this website.
            </Text>
            <Text style={styles.privacytext}>
              SGVR TECH is committed to ensuring that your privacy is protected.
              Should we ask you to provide certain information by which you can
              be identified when using this website, then you can be assured
              that it will only be used in accordance with this privacy
              statement.
            </Text>

            <Text style={styles.privacytext}>
              SGVR TECH may revise these Privacy Policies at any time without
              prior notice by updating this page and such revisions will be
              effective upon posting to this page. Please check this page
              periodically for any changes. Your continued use of this Website
              following the posting of any revisions to these Privacy Policy
              will mean you accept those changes. We reserve the right to alter,
              suspend or discontinue any aspect of the Website, including your
              access to it. Unless explicitly stated, any new features will be
              subject to these Terms of Use.
            </Text>

            <Text style={styles.privacytextheading}>
              Information we collect
            </Text>

            <Text style={styles.privacytextsubheading}>
              Contact information :
            </Text>

            <Text style={styles.privacytext}>
              We might collect your name, email, mobile number, phone number,
              street, city, state, pincode, country and IP address
            </Text>

            <Text style={styles.privacytextsubheading}>
              Information you post :
            </Text>

            <Text style={styles.privacytext}>
              We collect information you post in a public space on our website
              or on a third-party social media site belonging to SGVR TECH.
            </Text>

            <Text style={styles.privacytextsubheading}>
              Demographic information :
            </Text>

            <Text style={styles.privacytext}>
              We may collect demographic information about you, events you like,
              events you intend to participate in, tickets you buy, or any other
              information provided by your during the use of our website. We
              might collect this as a part of a survey also
            </Text>

            <Text style={styles.privacytextsubheading}>
              Other information :
            </Text>

            <Text style={styles.privacytext}>
              If you use our website, we may collect information about your IP
              address and the browser you're using. We might look at what site
              you came from, duration of time spent on our website, pages
              accessed or what site you visit when you leave us. We might also
              collect the type of mobile device you are using, or the version of
              the operating system your computer or device is running
            </Text>

            <Text style={styles.privacytextheading}>
              How we collect your information
            </Text>

            <Text style={styles.privacytextsubheading}>
              We collect information directly from you :
            </Text>

            <Text style={styles.privacytext}>
              We collect information directly from you when you register for an
              event or buy tickets. We also collect information if you post a
              comment on our websites or ask us a question through phone or
              email.
            </Text>

            <Text style={styles.privacytextsubheading}>
              We collect information from you passively :
            </Text>

            <Text style={styles.privacytext}>
              We use tracking tools like Google Analytics, Google Webmaster,
              browser cookies and web beacons for collecting information about
              your usage of our website.
            </Text>

            <Text style={styles.privacytextsubheading}>
              We get information about you from third parties :
            </Text>

            <Text style={styles.privacytext}>
              For example, if you use an integrated social media feature on our
              websites. The third-party social media site will give us certain
              information about you. This could include your name and email
              address.
            </Text>

            <Text style={styles.privacytextheading}>
              Use of your personal information
            </Text>

            <Text style={styles.privacytextsubheading}>
              We use information to contact you :
            </Text>

            <Text style={styles.privacytext}>
              We might use the information you provide to contact you for
              confirmation of a purchase on our website or for other promotional
              purposes.
            </Text>

            <Text style={styles.privacytextsubheading}>
              We use information to respond to your requests or questions :
            </Text>

            <Text style={styles.privacytext}>
              We might use your information to confirm your registration for an
              event or contest.
            </Text>

            <Text style={styles.privacytextsubheading}>
              We use information to improve our services :
            </Text>

            <Text style={styles.privacytext}>
              We might use your information to customize your experience with
              us. This could include displaying content based upon your
              preferences.
            </Text>

            <Text style={styles.privacytextsubheading}>
              We use information to look at site trends and customer interests :
            </Text>

            <Text style={styles.privacytext}>
              We may use your information to make our website and products
              better. We may combine information we get from you with
              information about you we get from third parties.
            </Text>

            <Text style={styles.privacytextsubheading}>
              We use information for security purposes :
            </Text>

            <Text style={styles.privacytext}>
              We may use information to protect our company, our customers, or
              our websites.
            </Text>

            <Text style={styles.privacytextsubheading}>
              We use information for marketing purposes :
            </Text>

            <Text style={styles.privacytext}>
              We might send you information about special promotions or offers.
              We might also tell you about new features. These might be our own
              offers, or third-party offers we think you might find interesting.
            </Text>

            <Text style={styles.privacytextsubheading}>
              We use information as otherwise permitted by law.
            </Text>

            <Text style={styles.privacytextheading}>
              Sharing of information
            </Text>

            <Text style={styles.privacytextsubheading}>
              Compliance with Law:
            </Text>

            <Text style={styles.privacytext}>
              We will share information to respond to a court order or subpoena.
              We may also share it if a government agency or investigatory body
              requests. We might also share information with good faith belief
              to enforce applicable terms of service or where disclosure of the
              information is necessary for legal process, to protect against
              harm to rights, property or safety of our users as required under
              the law.
            </Text>

            <Text style={styles.privacytextsubheading}>
              Sharing information with any successor to all or part of our
              business :
            </Text>

            <Text style={styles.privacytext}>
              In the event of an acquisition of the whole or a part of our
              business your personal information may be among the assets
              transferred. You acknowledge and consent that such transfer may
              occur and our permitted by this Privacy Policy and that any
              acquirer may continue to process your Personal Information as set
              forth in this Privacy Policy.
            </Text>

            <Text style={styles.privacytextheading}>Third party sites</Text>

            <Text style={styles.privacytext}>
              If you click on one of the links to third party websites, you may
              be taken to websites we do not control. This policy does not apply
              to the privacy practices of those websites. We are not responsible
              for these third-party sites
            </Text>

            <Text style={styles.privacytextheading}>Security</Text>

            <Text style={styles.privacytext}>
              The security of personal data is important to us. We maintain
              appropriate administrative, technical and physical safeguards to
              protect personal data against accidental or unlawful destruction,
              accidental loss, alteration, unauthorized disclosure or access,
              use, and all other unlawful forms of processing of the personal
              data in our possession. It is disclosed that security measures
              undertaken do not guarantee that your information will be
              fool-proof to any security breaches.
            </Text>

            <Text style={styles.privacytextheading}>
              Updates to this policy
            </Text>

            <Text style={styles.privacytext}>
              This Privacy Policy was last updated on 12.08.2020 From time to
              time we may change our privacy practices. We will notify you of
              any material changes to this policy as required by law. We will
              also post an updated copy on our website. Please check our site
              periodically for updates.
            </Text>

            <Text style={styles.privacytextheading}>Jurisdiction</Text>

            <Text style={styles.privacytext}>
              If you choose to visit the website, your visit and any dispute
              over privacy is subject to this Policy and the website's terms of
              use. In addition to the foregoing, any disputes arising under this
              Policy shall be governed by the laws of India.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  Heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: Theme.themeColor,
    marginLeft: 10,
  },
  privacytextheading: {
    fontSize: 20,
    fontWeight: "600",
    color: Theme.themeColor,
    marginTop: 20,
    marginBottom: 10,
    textTransform: "capitalize",
  },
  privacytext: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    color: "#2B2B2B",
    marginTop: 10,
    marginBottom: 10,
  },
  privacytextsubheading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2B2B2B",
    marginTop: 10,
    marginBottom: 1,
    textTransform: "capitalize",
  },
});

export default PrivacyPolicyScreen;
