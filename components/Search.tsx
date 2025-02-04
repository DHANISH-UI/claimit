import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const SearchBar: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // You can add search logic here
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleSearch}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 10,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
    },
    input: {
        height: 40,
        paddingHorizontal: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
    },
});

export default SearchBar;