import React from "react";
import { View, Text, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import { IconButton } from "react-native-paper";

const TermsAndConditions = ({ navigation }) => {
  return (
    <SafeAreaView style={{ marginTop: 55 }}>
      <View style={{ padding: 5, marginBottom: 100 }}>
        <View style={styles.container}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.Heading}>Terms & Conditions</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20, marginTop: 0 }}>
            <Text style={styles.privacytext}>
              By clicking on the “accept” button or accessing or otherwise using
              the services on www.sgvrtech.com ("Website"), the content writer
              hereby represents and warrants that it is duly authorized to enter
              into and bind writer or the entity writer represents to the terms
              and conditions of this agreement and acknowledges and agrees that
              all such use by content writers are subject to such terms and
              conditions. If the content writer does not agree to these terms or
              is not authorized to bind the entity writer represents, do not
              click the “accept” button.
            </Text>
            <Text style={styles.privacytext}>
              Throughout these Terms of Use, the words & "we", "us", "our", and
              SGVR TECH refer to SGVR TECH and its parent, subsidiaries, and
              affiliates collectively.
            </Text>

            <Text style={styles.privacytext}>
              We may revise these Terms of Use at any time without prior notice
              by updating this page and such revisions will be effective upon
              posting to this page. Please check this page periodically for any
              changes. Your continued use of this Website following the posting
              of any revisions to these Terms of Use will mean you accept those
              changes. We reserve the right to alter, suspend or discontinue any
              aspect of the Website, including your access to it. Unless
              explicitly stated, any new features will be subject to these Terms
              of Use.
            </Text>

            <Text style={styles.privacytextheading}>
              Use of SGVR TECH Website
            </Text>

            <Text style={styles.privacytext}>
              This site, together with all content (including User Content),
              data and other materials contained in the site is owned or
              controlled by SGVR TECH, a sole proprietorship registered as per
              Indian Laws, having its registered office at [].
            </Text>

            <Text style={styles.privacytext}>
              No part of this Website may be reproduced or transmitted in any
              form, by any means, electronic or mechanical, including
              photocopying and recording, except that SGVR TECH authorizes you
              to view, copy, download, and print SGVR TECH documents that are
              available on this web site.
            </Text>

            <Text style={styles.privacytextheading}>Contents</Text>

            <Text style={styles.privacytext}>
              Apart from your personal information (which is addressed in the
              Privacy Policy), any communication or material you send to the
              Website, electronically or otherwise, including but not limited to
              data, questions, comments, suggestions, or submissions is and will
              be treated as non-confidential and non-proprietary
            </Text>

            <Text style={styles.privacytextsubheading}>
              Content Posted by Visitors
            </Text>

            <Text style={styles.privacytext}>
              Except as otherwise provided herein any entries that you assign to
              SGVR TECH, upon submitting an entry to a project, or other
              documentation pertaining to a project, you retain any rights to
              ownership in any content posted, uploaded or otherwise sent to our
              Website by you; SGVR TECH will not gain ownership rights to this
              content. By posting, uploading or otherwise sending any content of
              any kind (including, without limitation, ideas, pitches and video
              entries) to us or our Website, you grant (or warrant that the
              owner of such rights has expressly granted) us a perpetual,
              royalty-free, irrevocable, non-exclusive right and license to use,
              reproduce and publish such content into any form, medium or
              technology, including the right, at SGVR TECH 's sole discretion,
              to distribute such content to be published by third parties
              throughout the universe.
            </Text>

            <Text style={styles.privacytextsubheading}>
              Prohibited on contents to be posted or uploading to our Website:
            </Text>

            <Text style={styles.privacytext}>
              Any material that infringes on any copyright, trademark, trade
              names, trade secrets, or other proprietary rights of another
              (including publicity and privacy rights); material that is
              obscene, offensive, libellous, pornographic, threatening, abusive,
              contains illegal content, or is otherwise objectionable, that
              would constitute or encourage a criminal offense, or that would
              otherwise give rise to liability or violates any law. You also
              represent that you have all necessary rights to use any material
              that you post or otherwise upload to our Website. You are further
              forbidden from distributing or otherwise publishing any material
              on our Website that contains any solicitation of funds or,
              promotion, employment, advertising, or solicitation for goods or
              services; sending unsolicited commercial e-mail and other
              advertising, promotional materials or other forms of solicitation
              to other users of this site; harvesting names and e-mail addresses
              from other users of this site without their permission; soliciting
              passwords from other users; impersonating other users; or sending
              viruses or other destructive or expropriating content.
            </Text>

            <Text style={styles.privacytextsubheading}>
              Right to remove content posted or Uploaded:
            </Text>

            <Text style={styles.privacytext}>
              We reserve the right to remove any postings or other uploaded
              materials in response to complaints of infringement, obscenity or
              defamation or to otherwise review or edit such materials as
              appropriate, in our sole discretion and without notice.
            </Text>

            <Text style={styles.privacytextsubheading}>
              Other Restrictions on Conduct:
            </Text>

            <Text style={styles.privacytext}>
              You are allowed to register with our Website only once and you
              must provide true and accurate registration information. You are
              prohibited from registering more than one time, even under a
              different SGVR TECH handle, misrepresenting your registration
              information, or tampering with the registration process. You agree
              not to disrupt, modify or interfere with the functioning of our
              Website or any services provided on or through our Website or with
              any associated software, hardware or servers in any way and you
              agree not to impede or interfere with others' use of our Website.
              This includes your agreement that you will not cheat; that the
              content submitted by you with respect to any Project is yours
              alone. This also includes your agreement that you will not provide
              your SGVR TECH information including, but not limited to, your
              SGVR TECH handle and rating, to any third party for the purpose of
              pursuing employment opportunities without the written consent of
              SGVR TECH. You also agree not to alter or tamper with any
              information or materials on, or associated with our Website or
              services provided on or through our Website. We do not necessarily
              endorse, support, sanction, encourage, verify or agree with the
              comments, opinions, or other statements made by the public at our
              Website by users through our forums or other interactive services
              available at our Website. Any information or material sent by
              users to any forums, including advice and opinions, represents the
              views and is the responsibility of those users and does not
              necessarily represent our views.
            </Text>

            <Text style={styles.privacytextheading}>Indemnity</Text>

            <Text style={styles.privacytext}>
              By using this web site, you agree to indemnify, hold harmless and
              defend SGVR TECH from any claims, damages, losses, liabilities,
              and all costs and expenses of defence, including but not limited
              to, attorneys’ fees, resulting directly or indirectly from a claim
              by a third party that is based on your use of this web site in
              violation of these terms.
            </Text>

            <Text style={styles.privacytext}>
              In addition, you hereby release us and any parent, subsidiary,
              sponsor or affiliated entities, our officers, directors and
              employees, and officers, directors and employees of any parent,
              subsidiary, sponsor or affiliated entities from any and all
              claims, demands, debts, obligations, damages (actual, special,
              indirect or consequential), costs, and expenses of any kind or
              nature whatsoever, whether known or unknown, suspected or
              unsuspected, disclosed or undisclosed, that you may have against
              us or them arising out of or in any way related to such disputes
              and/or to any services or products available at our Website. To
              the fullest extent permissible pursuant to applicable law, SGVR
              TECH shall not be liable for any damages (including, but not
              limited to, damages for loss of winnings, data or other damage to
              any other intangible property, even if SGVR TECH has been advised
              of the possibility of such damages), resulting from (i) the use of
              this Website or inability to use this Website, (ii) the disclosure
              of, unauthorized access to, or alteration of any transmission or
              data, (iii) the statements or conduct of any third party or (iv)
              any other matter relating to SGVR TECH
            </Text>

            <Text style={styles.privacytextheading}>
              Intellectual Property Rights
            </Text>

            <Text style={styles.privacytext}>
              The content on the Website, including, without limitation, the
              text, software, scripts, graphics, interactive features and the
              like ("Content") and the trademarks, copyrights, service marks and
              logos contained therein, are owned by SGVR TECH. The Content on
              the Website is provided to you for your information and personal
              use only and may not be used, copied, reproduced, distributed,
              transmitted, broadcast, displayed, sold, licensed, or otherwise
              exploited for any other purposes whatsoever without the prior
              written consent of SGVR TECH.
            </Text>

            <Text style={styles.privacytext}>
              You agree not to engage in the use, copying, or distribution of
              any of the Content other than as expressly permitted herein. You
              acknowledge that you do not acquire any ownership rights by
              downloading or printing copyrighted Content. You agree not to
              circumvent, disable or otherwise interfere with security related
              features of the Website or features that prevent or restrict use
              or copying of any Content or enforce limitations on use of the
              Website or the Content therein.
            </Text>

            <Text style={styles.privacytextheading}>Privacy Policy</Text>

            <Text style={styles.privacytext}>
              SGVR TECH recognises the importance of maintaining your privacy.
              This Policy describes how we treat user information we collect on
              the Website. This Privacy Policy applies to current and future
              visitors to our Website. By visiting and/or using our Website, you
              agree to this Privacy Policy. You may refer to our privacy policy
              on []
            </Text>

            <Text style={styles.privacytextheading}>
              No warranties and Limitation of liability
            </Text>

            <Text style={styles.privacytext}>
              There is no warranty that any information or service provided or
              referenced by this Web-Site is either accurate, that such
              information or service will fulfil any of your particular purposes
              or needs, or that such information or service does not infringe on
              any third-party rights. Except for any express warranties stated
              on this Web-Site, if any, the information and services provided or
              referenced on this site are provided "as is," “as available,” and
              with all faults, and the entire risk as to satisfactory quality,
              performance, accuracy and effort is with the user.
            </Text>

            <Text style={styles.privacytext}>
              SGVR TECH assumes no liability or responsibility for any errors or
              omissions in the content of the Web-Site. SGVR TECH is not liable
              for any direct, indirect, incidental, consequential, or punitive
              damages, however caused, arising out of your access to, use of, or
              reliance on the Web-Site, even if SGVR TECH has been advised of
              the possibility of such damages.
            </Text>

            <Text style={styles.privacytextheading}>
              Governing Law & Jurisdiction
            </Text>

            <Text style={styles.privacytext}>
              These Terms will be governed by and interpreted in accordance with
              the laws of the State of India, and you submit to the
              non-exclusive jurisdiction of the courts of Bangalore, India for
              the resolution of any disputes.
            </Text>

            <Text style={styles.privacytextheading}>Termination/Exclusion</Text>

            <Text style={styles.privacytext}>
              We reserve the right, in our sole discretion, to revoke any and
              all privileges associated with accessing and/or competing on our
              Website, and to take any other action we deem appropriate
              including but not limited to terminating or suspending your use of
              this Website, for no reason or any reason whatsoever, including
              improper use of this Website or failure to comply with these Terms
              of Use.
            </Text>

            <Text style={styles.privacytextheading}>
              Severability and Enforceability
            </Text>

            <Text style={styles.privacytext}>
              If any provision or portion of these Terms of Use is held illegal,
              invalid, or unenforceable, in whole or in part, such provision
              shall be modified to the minimum extent necessary to correct any
              deficiencies or replaced with a provision which is as close as is
              legally permissible to the provision found invalid or
              unenforceable and shall not affect the legality, validity or
              enforceability of any other provisions or portions of these Terms
              of Use.
            </Text>

            <Text style={styles.privacytext}>
              We reserve the right, in our sole discretion, to revoke any and
              all privileges associated with accessing and/or competing on our
              Website, and to take any other action we deem appropriate
              including but not limited to terminating or suspending your use of
              this Website, for no reason or any reason whatsoever, including
              improper use of this Website or failure to comply with these Terms
              of Use.
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
    color: "#D4AF37",
    marginLeft: 10,
  },
  privacytextheading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#D4AF37",
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

export default TermsAndConditions;
