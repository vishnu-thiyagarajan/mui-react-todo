import React, { useState, useContext, useEffect } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import ToggleButton from '@material-ui/lab/ToggleButton'
import Button from '@material-ui/core/Button'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ClearAllIcon from '@material-ui/icons/ClearAll'
import AddIcon from '@material-ui/icons/Add'
import SearchIcon from '@material-ui/icons/Search'
import ReactTooltip from 'react-tooltip'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'
import { TodoContext } from '../App'
import ButtonGrp from './ButtonGrp'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles({
  root: {
    background: 'white',
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px grey',
    color: 'black',
    padding: '0 0px'
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-around'
  },
  center: {
    display: 'flex',
    justifyContent: 'center'
  }
})
export function NaviBar (props) {
  const history = useHistory()
  const todoContext = useContext(TodoContext)
  const [name, setName] = useState('')
  const [selectedList, setSelectedList] = useState(null)
  const [input, setInput] = useState('')
  const getNewList = () => setInput(input === 'newlist' ? '' : 'newlist')
  const getSearchList = () => setInput(input === 'searchlist' ? '' : 'searchlist')
  const classes = useStyles()
  const addNewList = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      const data = {
        id: todoContext.todos.length ? parseInt(todoContext.todos[todoContext.todos.length - 1].id) + 1 : 0,
        listname: event.target.value,
        display: true,
        tasks: []
      }
      fetch('https://todomongoapi.herokuapp.com/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((res) => {
        if (res.status !== 201) return todoContext.setError(true)
        todoContext.setTodos([...todoContext.todos, data])
        setInput('')
        setName('')
        todoContext.setSuccess(true)
        todoContext.setMessage('New list created!')
      }).catch(function (err) {
        console.log('Fetch Error :', err)
        todoContext.setError(true)
      })
    }
  }
  const searchList = (event) => {
    const srchInput = event.target.value
    if (srchInput) todoContext.todos.forEach((item) => { item.display = item.listname.includes(srchInput) })
    if (!srchInput) todoContext.todos.forEach((item) => { item.display = true })
    todoContext.setTodos(todoContext.todos.slice())
  }
  useEffect(() => {
    setSelectedList(!!todoContext.selectedList)
  }, [todoContext.selectedList])
  return (
    <>
      <AppBar className={classes.root}>
        <Toolbar className={classes.controls}>
          {selectedList &&
            <Button onClick={() => history.goBack()}>
              <ArrowBackIcon color='primary' data-tip='Go Back' />
            </Button>}
          {!selectedList &&
            <ToggleButton
              data-tip='New List'
              value='false'
              selected={input === 'newlist'}
              onChange={getNewList}
            >
              <AddIcon color='primary' />
            </ToggleButton>}
          <ButtonGrp />
          {selectedList &&
            <Button data-tip='Clear done'>
              <ClearAllIcon color='primary' />
            </Button>}
          {!selectedList &&
            <ToggleButton
              data-tip='Search Lists'
              value='false'
              selected={input === 'searchlist'}
              onChange={getSearchList}
            >
              <SearchIcon color='primary' />
            </ToggleButton>}
        </Toolbar>
        <Box m='auto' p={1} width='50%'>
          {selectedList && <div className={classes.center}>{selectedList}</div>}
          {input === 'newlist' && !selectedList &&
            <TextField
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyPress={addNewList}
              size='small'
              autoFocus
              label='New list name'
              variant='outlined'
              fullWidth
            />}
          {input === 'searchlist' && !selectedList &&
            <TextField
              onKeyUp={searchList}
              onBlur={(event) => {
                event.target.value = ''
                searchList(event)
              }}
              size='small'
              autoFocus
              label='Search list name'
              type='search'
              variant='outlined'
              fullWidth
            />}
        </Box>
      </AppBar>
      <ReactTooltip place='bottom' />
    </>
  )
}
