<?php
class Service_Result
{
	protected $_head;
	protected $_data;
	protected $_info;
	protected $_result;

	public function __construct ()
	{
		//
		$this->_result = array();
	}

	public function format ()
	{
		$this->_result['header'] = $this->getHead();
		$this->_result['data'] = $this->getData();
		$this->_result['info'] = $this->getInfo();

		return $this->getResult();
	}




	/**
	 * set $_head
	 * @param mixed $head
	 * @return void
	 */
	public function setHeader ($head, $key = null)
	{
		if (is_array($head))
		{
			//throws E-WARNING since utf8_encode expects only 1 param, but array_walk gives 2... fixit
			@array_walk($head, 'utf8_encode');
		}
		if ($key)
		{
			$this->_head[$key] = $head;
		} else
		{
			$this->_head = $head;
		}
	}

	/**
	 * set $_data
	 * @param mixed $data
	 * @return void
	 */
	public function setData ($data, $key = null)
	{
//  if (is_array($data))
//  {
//  	array_walk_recursive($data, 'utf8_encode');
//  }
		if ($key)
		{
			$this->_data[$key] = $data;
		} else
		{
			$this->_data = $data;
		}
	}

	/**
	 * set $_info
	 * @param mixed $info
	 * @return void
	 */
	public function setInfo ($info, $key = null)
	{
		if (is_array($info))
		{
			//throws E-WARNING since utf8_encode expects only 1 param, but array_walk gives 2... fixit
			@array_walk($info, 'utf8_encode');
		}
		if ($key)
		{
			$this->_info[$key] = $info;
		} else
		{
			$this->_info = $info;
		}
	}

	/**
	 * get $_head
	 * @return mixed $_head
	 */
	public function getHead ()
	{
		return $this->_head;
	}

	/**
	 * get $_data
	 * @return mixed $_data
	 */
	public function getData ()
	{
		return $this->_data;
	}

	/**
	 * get $_info
	 * @return mixed $_info
	 */
	public function getInfo ()
	{
		return $this->_info;
	}


	/**
	 * get $_result
	 * @return mixed $_result
	 */
	public function getResult ()
	{
		return $this->_result;
	}

}
?>