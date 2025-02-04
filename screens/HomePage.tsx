import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // For icons

const LostAndFoundPage = () => {
    return (
        <View style={styles.container}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <Image source={require('../assets/images/logo copy.png')} style={styles.logo} />
                <View style={styles.navIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <MaterialIcons name="notifications" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <MaterialIcons name="account-circle" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButton}>
                        <MaterialIcons name="menu" size={28} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.tagline}>
                        "Reuniting Lost Items with Their Owners hello – Because Every Lost Item Deserves a Second Chance!"
                    </Text>
                </View>

                {/* Lost and Found Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.box, styles.lostBox]}>
                        <Text style={styles.boxText}>LOST</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.box, styles.foundBox]}>
                        <Text style={styles.boxText}>FOUND</Text>
                    </TouchableOpacity>
                </View>

                {/* Statistics Section */}
                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>This Week's Success</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>42</Text>
                            <Text style={styles.statLabel}>Items Reunited</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>1.2K</Text>
                            <Text style={styles.statLabel}>Active Users</Text>
                        </View>
                    </View>
                </View>

                {/* Footer Section */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Privacy Policy</Text>
                    <Text style={styles.footerText}>Terms of Service</Text>
                    <Text style={styles.footerText}>Contact Support</Text>
                    <Text style={styles.footerText}>About Us</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Light gray background for a clean look
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff', // White background for the navbar
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    logo: {
        width: 100, // Reduced size
        height: 30, // Reduced size
        borderRadius: 20,
        marginTop: 10, // Adjusted margin
    },
    navIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 15,
    },
    menuButton: {
        marginLeft: 15,
    },
    content: {
        flexGrow: 1,
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    tagline: {
        marginTop: 30,
        fontSize: 18, // Reduced size
        fontStyle: 'italic', // Italics
        fontWeight: '500',
        color: '#4a4a4a',
        textAlign: 'center',
        lineHeight: 24, // Adjusted line height
    },
    buttonContainer: {
        marginTop: 25,
        width: '100%',
        marginBottom: 30,
    },
    box: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    lostBox: {
        backgroundColor: '#ff6b6b', // Red for lost items
    },
    foundBox: {
        backgroundColor: '#4ecdc4', // Teal for found items
    },
    boxText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    statsContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 90, // Moved footer downward
        paddingVertical: 20, // Increased padding
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerText: {
        fontSize: 12,
        color: '#666',
    },
});

export default LostAndFoundPage;