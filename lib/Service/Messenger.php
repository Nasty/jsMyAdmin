<?php
class Service_Messenger
{
    protected $_messages = array();

    public function __construct($message = null)
    {
        if($message) 
        {
            $this->addMessage($message);
        }
    }

    public function addMessage($message)
    {
        $this->_messages[] = $message;
    }

    public function getMessages()
    {
        return $this->_messages;
    }
}
