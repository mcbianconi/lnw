import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, Marker, TileLayer } from 'react-leaflet'
import { Link, useHistory } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import api from '../../services/api'
import './styles.css'

interface Item {
    _key: string;
    name: string;
    image_url: string;
}

interface UF {
    id: number,
    nome: string,
    sigla: string
}

interface Cidade {
    id: number,
    nome: string
}




const CreatePoint = () => {


    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUFs] = useState<UF[]>([])
    const [cities, setCities] = useState<Cidade[]>([])

    const [selectedUF, setSelectedUF] = useState<string>()
    const [selectedCity, setSelectedCity] = useState<string>()
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    const history = useHistory()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        const {name, email, whatsapp} = formData
        const uf = selectedUF
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const items = selectedItems

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }

        const ENDPOINT = 'points'
        await api.post(ENDPOINT, data)

        history.push('/')


    }

    function handleItemClick(key: string) {
        const selected = selectedItems.findIndex(item => item === key)
        if (selected >=0) {
            const filteredItems = selectedItems.filter(item => item !== key)
            setSelectedItems(filteredItems)
        } else {
            setSelectedItems([...selectedItems, key])
        }
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([event.latlng.lat, event.latlng.lng])
    }

    function handleUFChange(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value
        setSelectedUF(uf)
    }

    function handleCityChange(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value
        setSelectedCity(city)
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target
        setFormData({...formData, [name]: value})
    }

    useEffect( () => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords
            setInitialPosition([latitude, longitude])
            setSelectedPosition([latitude, longitude])
        })
    }, [])

    useEffect( () => {
        const ENDPOINT = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
        axios.get<UF[]>(ENDPOINT).then(
            response => {
                setUFs(response.data)
            }
        )
    }, [])



    useEffect( () => {
        const ENDPOINT = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`
        api.get<Cidade[]>(ENDPOINT).then(
            response => {
                setCities(response.data)
            }
        )
    }, [selectedUF])

    useEffect( () => {
        api.get('items').then(
            response => {
                setItems(response.data)
            }
        )
    }, [])

    return (
        <div id="page-create-point">
            <header><img src={logo} alt="ecoleta"/>
            <Link to="/">
                <span>
                    <FiArrowLeft />
                </span>
                Voltar para home
            </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>
                <fieldset>
                    <legend><h2>Dados</h2></legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="name">Whatsapp</label>
                        <input
                            type="text"
                            id="whatsapp"
                            name="whatsapp"
                            onChange={handleInputChange}
                        />
                    </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUF} onChange={handleUFChange}>
                                <option value="">Selecione um Estado</option>
                                {
                                    ufs.map((uf) => (
                                    <option key={uf.id} value={uf.sigla}>{uf.sigla}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleCityChange}>
                                <option value="">Selecione uma cidade</option>
                                {
                                    cities.map((city) => (
                                    <option key={city.id} value={city.nome}>{city.nome}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item._key}
                                className={selectedItems.includes(item._key) ? 'selected' : ''}
                                onClick={() => handleItemClick(item._key)}>
                                <img src={item.image_url} alt="oleo"/>
                                <span>{item.name}</span>
                            </li>
                        ))}

                    </ul>
                </fieldset>

                <button type="submit">Cadastrar</button>
            </form>
        </div>
    )
}

export default CreatePoint
