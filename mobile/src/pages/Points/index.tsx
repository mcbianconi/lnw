import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Axios from 'axios';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import api from '../../services/api';


interface Endereco {
    bairro: string,
    cep: string,
    complemento: string,
    gia: string,
    ibge: string,
    localidade: string,
    logradouro: string,
    uf: string,
    unidade: string,
}

interface Item {
    _key: string,
    name: string,
    image_url: string
}

interface Point {
    _key: string,
    name: string,
    email: string,
    whatsapp: string,
    latitude: number,
    longitude: number,
    city: string,
    uf: string,
    items: string[],
    image?: string[]
}

interface Params {
    selectedCity: string,
    selectedUF: string,
}

const Points = () => {
    const [items, setItems] = useState<Item[]>([])
    const [poins, setPoints] = useState<Point[]>([])
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
    const [selectedUF, setSelectedUF] = useState<string>('')
    const [selectedCity, setSelectedCity] = useState<string>('')
    const [selectedItems, setSelectedItems] = useState<string[]>([])


    const route  = useRoute()
    const routeParams = route.params as Params

    function handleItemClick(key: string) {
        const selected = selectedItems.findIndex(item => item === key)
        if (selected >=0) {
            const filteredItems = selectedItems.filter(item => item !== key)
            setSelectedItems(filteredItems)
        } else {
            setSelectedItems([...selectedItems, key])
        }
    }

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    }, [])

    useEffect(() => {
        api.get('points', {
            params: {
                city: selectedCity,
                uf: selectedUF,
                items: selectedItems
            }
        }).then(response => {
            setPoints(response.data)
        })
    }, [selectedItems])

    useEffect(() => {
        async function loadPosition() {
            const {status} = await Location.requestPermissionsAsync()

            if (status !== 'granted') {
                Alert.alert('Ooops!', 'precisamos de permissão para obter sua localização')
                return
            }

            const location = await Location.getCurrentPositionAsync()
            const address_list = await Location.reverseGeocodeAsync(location.coords)
            const {latitude, longitude} = location.coords
            setInitialPosition([latitude, longitude])
            console.debug(address_list)
            const address = address_list[0]

            if (address && address.postalCode) {
                const endereco = (await Axios.get<Endereco>(`https://viacep.com.br/ws/${address.postalCode}/json/`)).data
                console.debug(endereco)
                setSelectedUF(endereco.uf)
                setSelectedCity(endereco.localidade)
            }
        }

        loadPosition()
    }, [])

    const navigation = useNavigation()

    function handleNavigateBack() {
        navigation.goBack()
    }

    function handleNavigateToDetail(_key: string) {
        navigation.navigate('Detail', { point_key: _key})
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79"></Icon>
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo</Text>
                <Text style={styles.subtitle}>Encontre pontos de coleta</Text>
                <Text style={styles.description}>{selectedCity} - {selectedUF}</Text>

                <View style={styles.mapContainer}>
                    {
                        initialPosition[0] === 0 ? <ActivityIndicator size="large" style={styles.map} color="#00ff00" /> :
                        <MapView
                            style={styles.map}
                            loadingEnabled={initialPosition[0] === 0}
                            initialRegion={{
                                latitude: -23.2493833,
                                longitude: -45.9134777,
                                latitudeDelta: 0.014,
                                longitudeDelta: 0.014
                            }}>

                            {poins.map(point => (

                                <Marker style={styles.mapMarker} onPress={() => handleNavigateToDetail(point._key)} key={point._key} coordinate={{
                                    latitude: point.latitude,
                                    longitude: point.longitude,
                                }}>
                                    <View style={styles.mapMarkerContainer}>
                                        <Image style={styles.mapMarkerImage} source={{ uri: point.image ? 'point.image' : '' }}></Image>
                                        <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                    </View>
                                </Marker>
                            ))}
                        </MapView>
                    }
                </View>

            </View>

            <View style={styles.itemsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {items.map(item => (
                        <TouchableOpacity style={[styles.item, selectedItems.includes(item._key) ? styles.selectedItem : {}]} onPress={() => handleItemClick(item._key)} key={item._key} activeOpacity={0.6}>
                            <SvgUri width={42} height={42} uri={item.image_url} />
                    <Text style={styles.itemTitle}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}



                </ScrollView>
            </View>
        </>)
}

export default Points


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C70',
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    subtitle: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',

        textAlign: 'center',
    },

    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});
