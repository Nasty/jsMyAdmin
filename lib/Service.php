<?php
require_once 'lib/Service/Exception.php';
require_once 'lib/Service/Messenger.php';
require_once 'lib/Service/Interface.php';
require_once 'lib/Service/Result.php';
require_once 'lib/Database.php';


class Service
{
    protected $_mode;

    public function __construct($mode)
    {
        $this->_mode = $mode;
    }

    public function authenticate($auth)
    {
        return (bool) $auth;
    }

    public function run($coreClass, $command, $parameters)
    {
        $messenger = new Service_Messenger();

        try {

            $reflection = new ReflectionClass($coreClass);
            $interface = 'Service_Interface';

            if(!$reflection->implementsInterface($interface))
            {
                if($reflection->hasMethod($command))
                {
                    $method = new ReflectionMethod($coreClass, $command);
                    if($method->isPublic() && $command != '__construct')
                    {
                        $core = new $coreClass($messenger);
                        $result = $core->$command($parameters);
                        return $this->_output($result, $messenger);
                    }
                }
                $messenger->addMessage('Invalid command');
                return $this->_output(false, $messenger);
            }
            else
            {
                throw new Service_Exception('Core Class does not implement ' . $interface);
            }
        }
        catch(Exception $e)
        {
            $messenger->addMessage('EXCEPTION' . "\n\n"
                . 'Exception Type: ' . get_class($e) . "\n"
                . 'File: ' . $e->getFile() . "\n"
                . 'Line: ' . $e->getLine() . "\n"
                . 'Message: ' . $e->getMessage() . "\n"
                . 'Stack Trace' . "\n" . $e->getTraceAsString());

            return $this->_output(false, $messenger);
        }
    }

    public function _output($result, Service_Messenger $messenger)
    {
        $returnObject = new stdClass();

        $returnObject->success = $result !== false;
        $returnObject->result = $result;
        $returnObject->messages = $messenger->getMessages();

        switch($this->_mode)
        {
            case 'print':
               $output = print_r($returnObject, true);
                break;
            case 'php':
                $output = serialize($returnObject);
                break;
            case 'json':
                // break intentionally omitted
            default:
                $output = json_encode($returnObject);
                break;
        }
        return $output;
    }
}
