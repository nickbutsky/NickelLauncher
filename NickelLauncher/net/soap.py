from __future__ import annotations
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import Element, SubElement
from datetime import datetime, timedelta

import requests


WUCLIENT = 'http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService'
WSU = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd'


class SOAPError(Exception):
    pass


def post_envelope(url: str, envelope: Envelope) -> Element:
    res = requests.post(
        url,
        data=ET.tostring(envelope),
        headers={'content-type': 'application/soap+xml; charset=utf-8'},
        verify=False
    )

    if res.status_code != 200:
        error_message = ET.fromstring(res.content).findtext('./{*}Body/{*}Fault/{*}Reason/{*}Text')
        error_message = error_message if error_message else 'An unknown error has occurred'
        error_message = error_message.strip()
        error_message = error_message + '.' if not error_message.endswith('.') else error_message
        raise SOAPError(error_message)

    return ET.fromstring(res.content)


class Envelope(Element):
    def __init__(self, url: str, element: Element):
        super().__init__(
            's:Envelope',
            {'xmlns:a': 'http://www.w3.org/2005/08/addressing', 'xmlns:s': 'http://www.w3.org/2003/05/soap-envelope'}
        )

        self.append(_Header(url, element.tag))

        body = SubElement(self, 's:Body')
        body.append(element)

        element.set('xmlns', WUCLIENT)


class _Header(Element):
    def __init__(self, url: str, method_name: str):
        super().__init__('s:Header')

        action = SubElement(self, 'a:Action', {'s:mustUnderstand': '1'})
        action.text = WUCLIENT + '/' + method_name
        message_id = SubElement(self, 'a:MessageID')
        message_id.text = 'urn:uuid:1a88ab88-d8eb-47bb-82d9-f2bd82654c6e'
        to = SubElement(self, 'a:To', {'s:mustUnderstand': '1'})
        to.text = url
        security = SubElement(
            self,
            'o:Security',
            {
                's:mustUnderstand': '1',
                'xmlns:o': 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd'
            }
        )
        timestamp = SubElement(security, 'Timestamp', {'xmlns': WSU})
        created = SubElement(timestamp, 'Created')
        created.text = (created_time := datetime.now()).strftime('%Y-%m-%dT%H:%M:%SZ')
        expires = SubElement(timestamp, 'Expires')
        expires.text = (created_time + timedelta(minutes=5)).strftime('%Y-%m-%dT%H:%M:%SZ')
        windows_update_tickets_token = SubElement(
            security,
            'wuws:WindowsUpdateTicketsToken',
            {
                'wsu:id': 'ClientMSA',
                'xmlns:wsu': WSU,
                'xmlns:wuws': 'http://schemas.microsoft.com/msus/2014/10/WindowsUpdateAuthorization'
            }
        )
        # if user.token:
        # ticket_type = ET.SubElement(
        #     windows_update_tickets_token, 'TicketType', {'Name': 'MSA', 'Version': '1.0', 'Policy': 'MBI_SSL'}
        # )
        #     user = ET.SubElement(ticket_type, 'User')
        #     user.text = user.token
        windows_update_tickets_token.append(
            Element('TicketType', {'Name': 'AAD', 'Version': '1.0', 'Policy': 'MBI_SSL'})
        )
