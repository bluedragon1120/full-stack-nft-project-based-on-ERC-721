import { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from 'react-modal';
import { css } from "@emotion/react";
import ClipLoader from "react-spinners/ClipLoader";
import xicon from '../../assets/images/x.png';
import bgimg from '../../assets/images/bg.png';
import { ethers } from 'ethers';

const override = css`
  display: block;
  margin: 0 auto;
  border-color: #fcee21;
`;

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        maxWidth: '100%'
    },
};

const Home = ({ changeActiveState, connect, killSession, connected, address, isPresale, addWhiteList, onValidate }) => {

    const [show, setShow] = useState(false);
    const [msgTitle, setMsgTitle] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [whiteList, setWhiteList] = useState('');
    const [isAdded, setIsAdded] = useState(0);


    const addOrRemoveWhiteList = async () =>{
        if(!address){
            setMsgTitle('Alert!');
            setMsgContent('Please connect your wallet.');
            handleShow();
            return;
        }
        setIsAdding(true);
        let result = await addWhiteList(whiteList, isAdded);
        if (result) {
            setIsAdding(false);
            setMsgTitle('Success!');
            setMsgContent('Transaction Success.');
            handleShow();
            setWhiteList("")
            setIsAdded(0)
        } else {
            setIsAdding(false);
            setMsgTitle('Failed!');
            setMsgContent('Transaction Failed.');
            handleShow();
        }

    }

    const onClickValidate = async () =>{
        if(!address){
            setMsgTitle('Alert!');
            setMsgContent('Please connect your wallet.');
            handleShow();
            return;
        }
        let result = await onValidate(whiteList);
        console.log(result)
        if (result) {
            setIsAdded(1)
        } else {
            setIsAdded(2)
        }
    }

    const changeState = async () => {
        if(!address){
            setMsgTitle('Alert!');
            setMsgContent('Please connect your wallet.');
            handleShow();
            return;
        }
        setIsLoading(true);
        let result = await changeActiveState();
        if (result) {
            setIsLoading(false);
            setMsgTitle('Success!');
            setMsgContent('Transaction Success.');
            handleShow();
        } else {
            setIsLoading(false);
            setMsgTitle('Failed!');
            setMsgContent('Transaction Failed.');
            handleShow();
        }
    }

    const onChangeAddress = async (e) => {
        setWhiteList(e.target.value);
        if(!ethers.utils.isAddress(e.target.value)) setIsAdded(0); 
    }

    return (
        <div>
            <section className="private-sale">
                <div className="container">
                    <div className="private-sale-details">
                        <div style={{ textAlign: 'right' }}>
                            {connected ? (
                                <Button onClick={killSession} style={{ color: 'black', border: 'none', height: '50px', padding: '0 20px', fontSize: '22px', fontFamily: 'Mode Seven', marginBottom: '20px' }}>{address.substring(0, 5) + '...' + address.substring(38)}</Button>
                            ) : (
                                <Button onClick={connect} style={{ color: 'black', border: 'none', height: '50px', padding: '0 20px', fontSize: '22px', fontFamily: 'Mode Seven', marginBottom: '20px' }}>CONNECT WALLET</Button>
                            )}
                        </div>
                        <div className="section-header text-center" data-aos-anchor-placement="center-center">
                            <div class="input-area">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="formGroupExampleInput"
                                    value={whiteList}
                                    onChange={(e) => onChangeAddress(e)}
                                />
                                <Button onClick={(e) => onClickValidate()} color="red"  style={{ color: 'black', border: 'none', height: '50px', padding: '0 20px', fontSize: '18px', fontFamily: 'Mode Seven' }}>Validate</Button>    
                            </div>
                            {
                                isAdding 
                                ? <Button style={{marginRight: '20px', color: 'black', border: 'none', height: '50px', padding: '0 20px', fontSize: '18px', fontFamily: 'Mode Seven', marginBottom: '20px' }}>
                                    <ClipLoader color="black" loading={isAdding} css={override} size={35} />
                                </Button>
                                : <Button disabled={isAdded < 1} onClick={(e) => addOrRemoveWhiteList()} color="red"  style={{ marginRight: '20px', color: 'black', border: 'none', height: '50px', padding: '0 20px', fontSize: '18px', fontFamily: 'Mode Seven', marginBottom: '20px' }}>{isAdded == 1 ? "Remove" : ( isAdded == 2 ? "Add" : "Add") } Whitelist</Button>
                            }
                            
                            {
                                isLoading 
                                ? <Button style={{ color: 'black', border: 'none', height: '50px', padding: '0 20px', fontSize: '18px', fontFamily: 'Mode Seven', marginBottom: '20px' }}>
                                    <ClipLoader color="black" loading={isLoading} css={override} size={35} />
                                </Button>
                                : <Button onClick={(e) => changeState()} style={{ color: 'black', border: 'none', height: '50px', padding: '0 20px', fontSize: '18px', fontFamily: 'Mode Seven', marginBottom: '20px' }}>{isPresale ? 'Disable ' : 'Enable'} WhiteList</Button>
                            }
                        </div>
                    </div>
                </div>
            </section>
            <Modal
                isOpen={show}
                onRequestClose={handleClose}
                style={customStyles}
            >
                <div style={{ width: '100%', padding: '20px', cursor: 'pointer', textAlign: 'right' }}>
                    <img src={xicon} className='modal1-close-btn' onClick={handleClose} />
                </div>
                <div className='modal1-text'>
                    <h2 style={{ textAlign: 'center' }}>{msgTitle}</h2>
                    <div style={{ textAlign: 'center', width: '100%', marginTop: '40px' }}>
                        <h4>{msgContent}</h4>
                    </div>
                </div>
                <div style={{ textAlign: 'center', width: '100%', margin: '60px 0 30px 0' }}>
                    <Button onClick={handleClose} style={{ color: 'black', border: 'none', width: '160px', height: '50px', fontSize: '22px', fontFamily: 'Mode Seven' }}>Close</Button>
                </div>
            </Modal>
        </div>
    )
}

export default Home;